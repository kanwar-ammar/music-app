const express = require("express");
var router = express.Router();
const User = require("../models/userModel");

router.get("/allusers", async function (req, res) {
  const allUsers = await User.find();
  res.status(200).json({
    data: allUsers,
  });
});

router.post("/follow", async function (req, res) {
  console.log("follow");
  const { userId,userInfo } = req.body;
  const user = await User.findOne({ userId });
  user.followers.push(userInfo);
  user.save();
  res.status(200).json({
    user,
  });
});

module.exports = router;
