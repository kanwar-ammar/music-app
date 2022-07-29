const express = require("express");
var router = express.Router();
const User = require("../models/userModel");
const userController = require("../controllers/userController");

router.post("/signup", userController.signup);
router.post("/login", userController.login);

router.get("/allusers", userController.getAllUsers);

router.post("/testapi", async function (req, res) {
  const spotifyId = "62dc0abe8d0aa51524aaa023";
  const IndiUser = await User.findById("62dc142d74c4d179b8739d7f");
  console.log(IndiUser);
  IndiUser.spotifyId = spotifyId;
  IndiUser.save();
  res.status(200).json({
    IndiUser,
  });
});

router.post("/follow/:userSpotifyId", async function (req, res) {
  try {
    const { userSpotifyId } = req.params;
    const { followUser } = req.body;
    const user = await User.findOne({ userSpotifyId });
    const userFollowed = await User.findOne({
      userSpotifyId: followUser.userSpotifyId,
    });
    console.log(userSpotifyId, followUser.userSpotifyId);
    if (userSpotifyId === followUser.userSpotifyId) {
      return res.status(400).json({
        message: "a user cannot follow himself",
      });
    }
    for (var followers of user.following) {
      if (followers.userSpotifyId === followUser.userSpotifyId) {
        return res.status(400).json({
          message: "user is already followed",
        });
      }
    }
    user.following.push(followUser);
    userFollowed.followers.push(user);
    user.save();
    userFollowed.save();
    res.status(200).json({
      message: "user followed successfully",
      data: user,
    });
  } catch (err) {
    res.status(400).json({
      message: err.message,
    });
  }
});

//used in user.js
router.get("/loggedInUser/:userId", async function (req, res) {
  const { userId } = req.params;
  console.log("Logged in user", userId);
  const user = await User.findById(userId).populate("spotifyId deezerId");
  res.status(200).json({
    data: user,
  });
});

module.exports = router;
