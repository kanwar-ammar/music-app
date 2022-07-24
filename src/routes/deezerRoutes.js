const express = require("express");
var router = express.Router();
require("dotenv").config();
const axios = require("axios");
var request = require("request");
const app_id = 551862;
const User = require("../models/userModel");
const storeDeezerPlaylists = require("../helpers/storeDeezerPlaylists");
const secret_key = "043c79149175f71a76bed0f794e5a71c";

router.get("/login", function (req, res) {
  console.log(req.query.code);
  const code = req.query.code;
  var options = {
    url: `https://connect.deezer.com/oauth/access_token.php?app_id=${app_id}&secret=${secret_key}&code=${code}`,
    headers: {
      "Content-Type": "application/json",
    },
  };

  request.get(options, async function (error, response, body) {
    // console.log(await body.split("=")[1].split("&")[1]);
    const deezerAccessToken = body.split("=")[1].split("&")[0];
    console.log("deezerAccessToken", deezerAccessToken);

    var info = {
      url: `https://api.deezer.com/user/me?access_token=${deezerAccessToken}&output=jsonp&output=jsonp&version=js-v1.0.0`,
    };

    request.get(info, async function (error, response, body) {
      const user = await eval(body.replace("/(/g", ""));
      console.log(user, user.id);
      const deezerUser = await User.findOne({ userDeezerId: user.id });
      if (!deezerUser) {
        console.log("user not found", user);
        const newUser = new User({
          userDeezerId: user.id,
          deezerAccessToken: deezerAccessToken,
          deezerName: user.name,
          deezerImage: user.picture,
          deezerEmail: user.email,
        });
        await newUser.save().then((res) => {
          console.log("user saved", res);
        });
      } else {
        console.log("user already available");
        deezerUser.deezerAccessToken = deezerAccessToken;
        deezerUser.save();
        console.log("token refreshed", deezerUser);
      }
    });

    return res.redirect(`http://localhost:3000/dashboard#access_token=${body}`);
  });
});

router.get("/deezerPlaylist/:userId", async function (req, res) {
  let userPlaylists;
  const { userId } = req.params;
  var options = {
    url: `https://api.deezer.com/user/${userId}/playlists`,
  };
  request.get(options, async function (error, response, body) {
    const allDeezerPlaylists = JSON.parse(body);
    const userDeezerPlaylists = await storeDeezerPlaylists.storeDeezerPlaylists(
      allDeezerPlaylists
    );
    console.log(userDeezerPlaylists);
    res.status(200).json({ data: userDeezerPlaylists });
  });
  // console.log("user playist response", userPlaylists);
});

module.exports = router;
