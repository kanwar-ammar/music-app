const express = require("express");
var router = express.Router();
const User = require("../models/userModel");

router.get("/allusers", async function (req, res) {
  const allUsers = await User.find();
  res.status(200).json({
    data: allUsers,
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

module.exports = router;
