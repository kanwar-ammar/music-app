const express = require("express");
var router = express.Router();
require("dotenv").config();
var request = require("request");
var querystring = require("querystring");
const User = require("../models/userModel");
const spotifyUserModel = require("../models/userSpotifyModel");
const allPlaylists = require("../models/allPlaylistsModel");
const storePlaylists = require("../helpers/storePlaylists");
const validateToken = require("../middlewares/validateToken");
var axios = require("axios");

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

  request.post(authOptions, async function (error, response, body) {
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
        const userSpotifyId = body.id;
        console.log("user spotify ID... ", userSpotifyId);
        const spotifyUser = await spotifyUserModel.findOne({ userSpotifyId });
        if (spotifyUser) {
          //update spotify token in database
          spotifyUser.spotifyAccessToken = access_token;
          spotifyUser.save();
          console.log("user already in database...  ", spotifyUser);
          return res.redirect(
            `http://localhost:3000/dashboard?userSpotifyId=${spotifyUser.userSpotifyId}`
          );
        } else {
          //  save user data here
          const newuser = new spotifyUserModel({
            userSpotifyId: userSpotifyId,
            name: body.display_name,
            email: body.email,
            image: body.images[0]
              ? body.images[0].url
              : "https://www.pngitem.com/pimgs/m/524-5246388_anonymous-user-hd-png-download.png",
            // userId: "@" + userId.replace(/\s/g, ""),
            spotifyAccessToken: access_token,
            spotifyRefreshToken: refresh_token,
          });
          return newuser.save(async (err, user) => {
            return res.redirect(
              `http://localhost:3000/dashboard?userSpotifyId=${user.userSpotifyId}`
            );
          });
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

router.post("/storeSpotify/:userId", async function (req, res) {
  try {
    const { userSpotifyId } = req.body;
    const { userId } = req.params;
    const indiUser = await User.findById(userId);
    console.log(indiUser);
    if (indiUser.spotifyId) {
      return res.status(401).json({
        message: "Already connected with spotify",
        data: indiUser,
      });
    }
    const spotifyUser = await spotifyUserModel.findOne({ userSpotifyId });
    console.log(spotifyUser);
    if (spotifyUser) {
      indiUser.spotifyId = spotifyUser._id;
      indiUser.save(async (err, user) => {
        return res.status(200).json({
          data: user,
        });
      });
    }
  } catch (err) {
    res.status(400).json({
      message: err.message,
    });
  }
});

//used in playlist.js
router.get("/userPlaylists/:userId", async function (req, res) {
  const { userId } = req.params;
  console.log("user Id in get spotify playlists", userId);
  const user = await User.findById(userId).populate("spotifyId");
  console.log(user);
  if (user.spotifyId) {
    console.log("user in DB", user.spotifyId.spotifyRefreshToken);
    var access_tokenin = user.spotifyId.spotifyAccessToken;
    const refresh_token = user.spotifyId.spotifyRefreshToken;

    let allTracks = []; //all tracks of user with their respective playlists are stored here
    var authOptions = {
      url:
        "https://api.spotify.com/v1/users/" +
        user.spotifyId.userSpotifyId +
        "/playlists",
      headers: { Authorization: "Bearer " + access_tokenin },
      json: true,
    };
    request.get(authOptions, async function (error, response, body) {
      console.log("error in user playlists", body.error);
      if (body.error) {
        if (body.error.message === "The access token expired") {
          console.log("inside userPlaylists");
          res.redirect(`/api/spotify/refresh_token/${userId}`);
        }
      } else {
        if (!error && response.statusCode === 200) {
          const userPlaylists = body.items;
          const result = await storePlaylists.storePlaylists(
            userPlaylists,
            access_tokenin
          );
          console.log("result in user playlists", result);
          const allUserPlaylists = {
            userId: userId,
            Playlists: result,
          };
          res.status(200).json({
            data: allUserPlaylists,
          });
        }
      }
    });
  } else {
    res.status(400).json({
      message: "spotify account not connected",
    });
  }
});

//api used for refreshing spotify access token of a user because it expires after some time
router.get("/refresh_token/:userId", async function (req, res) {
  const { userId } = req.params;
  validateToken.validateToken(userId);
  res.redirect("back");
});

router.get("/validateToken/:userId", async function (req, res) {
  const { userId } = req.params;
  const user = await User.findById(userId).populate("spotifyId");
  const spotifyUser = await spotifyUserModel.findById(user.spotifyId._id);
  var options = {
    url: "https://api.spotify.com/v1/me",
    headers: { Authorization: "Bearer " + spotifyUser.spotifyAccessToken },
    json: true,
  };
  request.get(options, async function (error, response, body) {
    if (body.error) {
      if (body.error.message === "The access token expired") {
        validateToken.validateToken(userId);
        return res.status(200).json({
          message: "access Token refreshed",
        });
      }
    } else {
      return res.status(200).json({
        message: "no need to refresh Token",
      });
    }
  });
});

router.get("/connectSpotify", async function (req, response) {
  axios
    .get(
      "https://accounts.spotify.com/authorize?response_type=code&client_id=e920a468f15a49ddae5075a574cddd9b&scope=user-read-private%20user-read-email%20user-modify-playback-state%20user-read-playback-position%20user-library-read%20streaming%20user-read-playback-state%20user-read-recently-played%20playlist-read-private&redirect_uri=http://localhost:8888/api/spotify/callback"
    )
    .then((res) => console.log(res));
});

module.exports = router;
