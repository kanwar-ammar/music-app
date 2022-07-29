const express = require("express");
var router = express.Router();
require("dotenv").config();
var request = require("request");
var querystring = require("querystring");
const User = require("../models/userModel");
const allPlaylists = require("../models/allPlaylistsModel");
const userSpotifyModel = require("../models/userSpotifyModel");

var stateKey = "spotify_auth_state";
var client_id = process.env.CLIENT_ID;
var client_secret = process.env.CLIENT_SECRET;
var redirect_uri = "http://localhost:8888/api/spotify/callback"; // Your redirect uri
//18.132.114.99

async function validateToken(userId, req, res, next) {
  console.log("inside validate token", userId);
  const user = await User.findById(userId).populate("spotifyId");
  const spotifyUser = await userSpotifyModel.findById(user.spotifyId._id);

  // requesting access token from refresh token
  var refresh_token = spotifyUser.spotifyRefreshToken;
  var authOptions = {
    url: "https://accounts.spotify.com/api/token",
    headers: {
      Authorization:
        "Basic " +
        new Buffer(client_id + ":" + client_secret).toString("base64"),
    },
    form: {
      grant_type: "refresh_token",
      refresh_token: refresh_token,
    },
    json: true,
  };

  request.post(authOptions, async function (error, response, body) {
    if (!error && response.statusCode === 200) {
      const access_token = body.access_token;
      spotifyUser.spotifyAccessToken = access_token;
      //save user with new access token
      return spotifyUser.save(async (err, user) => {
        console.log("updated user", spotifyUser);
        return;
      });
    }
  });
}

module.exports = {
  validateToken: validateToken,
};
