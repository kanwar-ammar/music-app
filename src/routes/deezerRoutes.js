const express = require("express");
var router = express.Router();
require("dotenv").config();
const axios = require("axios");
var request = require("request");
const User = require("../models/userModel");
const deezerUserModel = require("../models/userDeezerModel");
const storeDeezerPlaylists = require("../helpers/storeDeezerPlaylists");
const userDeezerModel = require("../models/userDeezerModel");
const secret_key = process.env.DEEZER_SECRET;
const app_id = process.env.DEEZER_APP_ID;

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
      const deezerUser = await eval(body.replace("/(/g", ""));
      const savedDeezerUser = await userDeezerModel.findOne({
        userDeezerId: deezerUser.id,
      });
      if (!savedDeezerUser) {
        console.log("user not found", savedDeezerUser);
        const newUser = new userDeezerModel({
          userDeezerId: deezerUser.id,
          deezerAccessToken: deezerAccessToken,
          name: deezerUser.name,
          image: deezerUser.picture,
          email: deezerUser.email,
        });
        console.log("new user to be saved", newUser);
        return await newUser.save().then((user) => {
          console.log("saved user", user);
          return res.redirect(
            `http://localhost:3000/dashboard?userDeezerId=${user.userDeezerId}`
          );
        });
      } else {
        console.log("user already available");
        savedDeezerUser.deezerAccessToken = deezerAccessToken;
        return savedDeezerUser.save(async (err, user) => {
          return res.redirect(
            `http://localhost:3000/dashboard?userDeezerId=${user.userDeezerId}`
          );
        });
      }
    });

    // return res.redirect(`http://localhost:3000/dashboard#access_token=${body}`);
  });
});

router.post("/storeDeezer/:userId", async function (req, res) {
  try {
    const { userDeezerId } = req.body;
    const { userId } = req.params;
    const indiUser = await User.findById(userId);
    console.log(indiUser);
    if (indiUser.deezerId) {
      return res.status(401).json({
        message: "Already connected with deezer",
      });
    }
    const deezerUser = await deezerUserModel.findOne({ userDeezerId });
    console.log(deezerUser);
    if (deezerUser) {
      indiUser.deezerId = deezerUser._id;
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

router.get("/deezerPlaylist/:userId", async function (req, res) {
  try {
    let userPlaylists;
    const { userId } = req.params;
    const indiUser = await User.findById(userId).populate("deezerId");
    console.log(indiUser.deezerId.userDeezerId);
    var options = {
      url: `https://api.deezer.com/user/${indiUser.deezerId.userDeezerId}/playlists`,
    };
    request.get(options, async function (error, response, body) {
      const allDeezerPlaylists = JSON.parse(body);
      const userDeezerPlaylists =
        await storeDeezerPlaylists.storeDeezerPlaylists(allDeezerPlaylists);
      console.log(userDeezerPlaylists);
      res.status(200).json({ data: userDeezerPlaylists });
    });
    // console.log("user playist response", userPlaylists);
  } catch (err) {
    res.status(400).json({
      message: err.message,
    });
  }
});

module.exports = router;
