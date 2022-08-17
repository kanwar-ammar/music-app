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

router.post("/follow/:userId", async function (req, res) {
  try {
    const { followUserId } = req.body;
    const { userId } = req.params;
    const user = await User.findOne(
      { _id: userId },
      {
        password: 0,
        favorites: 0,
        deezerId: 0,
        spotifyId: 0,
      }
    );
    const userFollowed = await User.findById(
      { _id: followUserId },
      {
        password: 0,
        favorites: 0,
        deezerId: 0,
        spotifyId: 0,
      }
    );
    if (userId === followUserId) {
      return res.status(400).json({
        message: "a user cannot follow himself",
      });
    }
    for (var followingId of user.following) {
      if (followingId === followUserId) {
        return res.status(400).json({
          message: "user is already followed",
        });
      }
    }
    console.log(
      "logged in user",
      user.following,
      "user to be followed",
      userFollowed.followers
    );
    user.following.push(followUserId);
    user.save();
    userFollowed.followers.push(userId);
    userFollowed.save();

    return res.status(200).json({
      message: "user followed successfully",
      data: user,
    });
  } catch (err) {
    console.log(err);
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
  console.log(user.following);
  const userFollowing = await User.find(
    { _id: { $in: user.following } },
    {
      password: 0,
      favorites: 0,
      deezerId: 0,
      spotifyId: 0,
      followers: 0,
      following: 0,
    }
  );
  const userFollowed = await User.find(
    { _id: { $in: user.followers } },
    {
      password: 0,
      favorites: 0,
      deezerId: 0,
      spotifyId: 0,
      followers: 0,
      following: 0,
    }
  );
  console.log("Followers", userFollowed, "Following", userFollowing);
  user["followers"] = userFollowed;
  user["following"] = userFollowing;
  res.status(200).json({
    data: user,
  });
});

module.exports = router;
