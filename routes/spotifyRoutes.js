const express = require("express");
var router = express.Router();
require("dotenv").config();
var request = require("request");
var querystring = require("querystring");
const User = require("../models/userModel");
const allPlaylists = require("../models/allPlaylistsModel");
const storePlaylists = require("../helpers/storePlaylists")
const validateToken = require("../middlewares/validateToken")
// import validateToken from "../middlewares/validateToken";
var stateKey = "spotify_auth_state";
var client_id = process.env.CLIENT_ID;
var client_secret = process.env.CLIENT_SECRET;
var redirect_uri = "http://localhost:8888/api/spotify/callback"; // Your redirect uri
//18.132.114.99

var generateRandomString = function (length) {
  var text = "";
  var possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

router.get("/login", function (req, res, next) {
  //return code=can be exchanged for access token and state= protection
  console.log("logged in");
  var state = generateRandomString(16);
  res.cookie(stateKey, state);

  // your application requests authorization
  // what we will be needing from a user
  var scope =
    "user-read-private user-read-email user-modify-playback-state user-read-playback-position user-library-read streaming user-read-playback-state user-read-recently-played playlist-read-private";
  console.log(
    "https://accounts.spotify.com/authorize?" +
      querystring.stringify({
        response_type: "code",
        client_id: client_id,
        scope: scope,
        redirect_uri: redirect_uri,
        state: state,
      })
  );
  res.redirect(
    "https://accounts.spotify.com/authorize?" +
      querystring.stringify({
        response_type: "code",
        client_id: client_id,
        scope: scope,
        redirect_uri: redirect_uri,
        state: state,
      })
  );
});

let access_token;

router.get("/callback", function (req, res) {
  // your application requests refresh and access tokens
  // after checking the state parameter
  console.log("req.query", req.query);
  var code = req.query.code || null;

  res.clearCookie(stateKey);
  var authOptions = {
    url: "https://accounts.spotify.com/api/token",
    form: {
      code: code,
      redirect_uri: redirect_uri,
      grant_type: "authorization_code",
    },
    headers: {
      Authorization:
        "Basic " +
        new Buffer(client_id + ":" + client_secret).toString("base64"),
    },
    json: true,
  };

  request.post(authOptions, function (error, response, body) {
    console.log("CLIENT _ID", client_id);
    console.log("CLIENT_SECRET,", client_secret);
    console.log("REDIRECT_URI", redirect_uri);
    console.log("error in callback", body);
    // console.log("response status code in callback", response.statusCode);
    if (!error && response.statusCode === 200) {
      (access_token = body.access_token), (refresh_token = body.refresh_token);

      var options = {
        url: "https://api.spotify.com/v1/me",
        headers: { Authorization: "Bearer " + access_token },
        json: true,
      };
      // use the access token to access the Spotify Web API
      request.get(options, async function (error, response, body) {
        console.log("body in call back", body);
        const userId = body.display_name.toLowerCase();
        const userSpotifyId = body.id;
        console.log("user spotify ID... ", userSpotifyId);
        const spotifyUser = await User.findOne({ userSpotifyId });
        if (spotifyUser) {
          //update spotify token in database
          spotifyUser.spotifyAccessToken = access_token;
          spotifyUser.save();
          console.log("user already in database...  ", spotifyUser);
          res.redirect(
            `http://localhost:3000/dashboard#userSpotifyId=${userSpotifyId}`
            // http://music-webapp.s3-website.eu-west-2.amazonaws.com
          );
        } else {
          //  save user data here
          const user = new User({
            userSpotifyId: userSpotifyId,
            name: body.display_name,
            email: body.email,
            image:body.images[0]?body.images[0].url:"https://www.pngitem.com/pimgs/m/524-5246388_anonymous-user-hd-png-download.png",
            userId: "@" + userId.replace(/\s/g, ""),
            spotifyAccessToken: access_token,
            spotifyRefreshToken: refresh_token,
          });
          console.log("saved user in database", user);
          user.save();
          res.redirect(
            `http://localhost:3000/dashboard#userSpotifyId=${userSpotifyId}`
            // http://music-webapp.s3-website.eu-west-2.amazonaws.com
          );
        }
      });
    } else {
      res.redirect(
        "/#" +
          querystring.stringify({
            error: "invalid_token",
          })
      );
    }
  });
  // }
});


//used in user.js
router.get("/loggedInUser/:userId", async function (req, res) {
  const { userId } = req.params;
  console.log("Logged in user", userId);
  const user = await User.findOne({ userSpotifyId: userId });
  res.status(200).json({
    data: user,
  });
});

//used in playlist.js
router.get("/userPlaylists/:userId", async function (req, res) {
  const { userId } = req.params;
  console.log(userId);
  const user = await User.findOne({ userSpotifyId: userId });
  console.log("user in DB", user);
  var access_tokenin = user.spotifyAccessToken;
  const refresh_token = user.spotifyRefreshToken;

  let allTracks = []; //all tracks of user with their respective playlists are stored here
  var authOptions = {
    url: "https://api.spotify.com/v1/users/" + userId + "/playlists",
    headers: { Authorization: "Bearer " + access_tokenin },
    json: true,
  };
  request.get(authOptions,async function (error, response, body) {
    console.log("error in user playlists", body.error);
    if (body.error) {
      if (body.error.message === "The access token expired") {
        console.log("inside userPlaylists");
        res.redirect(`/api/spotify/refresh_token/${userId}`);
        // validateToken.validateToken(userId);
      }
    } else {
      if (!error && response.statusCode === 200) {
        const userPlaylists = body.items;
        const result =await storePlaylists.storePlaylists(userPlaylists,access_tokenin)
        console.log("result in user playlists",result)
        // userPlaylists.map(function (playlist) {
        //   const playlistName = playlist.name;
        //   const playlistId = playlist.id;
        //   const playlistImage = playlist.images[0]
        //     ? playlist.images[0].url
        //     : "https://pbs.twimg.com/profile_images/558556141605511168/2JDJX8SQ_400x400.png";
        //   const noOfTracks = playlist.tracks.total;
        //   const playlistOwner = playlist.owner.display_name;
        //   const getTracks = {
        //     url:
        //       "https://api.spotify.com/v1/playlists/" + playlistId + "/tracks",
        //     headers: { Authorization: "Bearer " + access_tokenin },
        //     json: true,
        //   };
        //   request.get(getTracks, function (error, response, body) {
        //     if (!error && response.statusCode === 200) {
        //       let _allTracks = [];
        //       body.items.map((track) => {
        //         _allTracks.push({
        //           added_at: track.added_at,
        //           title: track.track.name,
        //           duration: track.track.duration_ms,
        //           image: track.track.album.images[0].url,
        //           albumName: track.track.album.name,
        //           artists: track.track.artists.map((a) => a.name),
        //           spotifyUri: track.track.uri,
        //         });
        //       });
        //       allTracks.push({
        //         playlistName: playlistName,
        //         playlistId: playlistId,
        //         playlistOwner: playlistOwner,
        //         playlistImage: playlistImage,
        //         noOfTracks: noOfTracks,
        //         Tracks: _allTracks,
        //       });
        //     }
        //   });
        // });
        // setTimeout(function () {
        //   const allUserPlaylists = new allPlaylists({
        //     userId: userId,
        //     Playlists: allTracks,
        //   });
        //   // allUserPlaylists.save();
        //   // console.log("all playlists with tracks saved", allUserPlaylists);
        //   res.status(200).json({
        //     data: allUserPlaylists,
        //   });
        // }, 3000);
        const allUserPlaylists ={
          userId: userId,
          Playlists: result,
      }
      res.status(200).json({
        data: allUserPlaylists,
      });
      }
    }
  });
});

//api used for refreshing spotify access token of a user because it expires after some time
router.get("/refresh_token/:userId", async function (req, res) {
  const { userId } = req.params;
  validateToken.validateToken(userId);
  res.redirect("back");
});

module.exports = router;
