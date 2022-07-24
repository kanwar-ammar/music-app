const express = require("express");
var router = express.Router();
const Mixtape = require("../models/mixtapeModel");
const User = require("../models/userModel");

router.post("/createMixtape/:userId", async function (req, res) {
  console.log(req.body);
  const { userId } = req.params;
  const { title, description, tracks, imgsrc } = req.body;
  const newMixtape = new Mixtape({
    title: title.replace(/\s/g, ""),
    imgsrc: imgsrc ? imgsrc : tracks[0].image,
    description: description,
    tracks: tracks,
    userId: userId,
  });
  newMixtape.save();
  res.status(200).json({
    message: "new mixtape created",
  });
});

router.get("/allUserMixtapes/:userId", async function (req, res) {
  const { userId } = req.params;
  const mixtapes = await Mixtape.find({ userId: userId });
  console.log("all mixtapes on backend", mixtapes);
  res.status(200).json({
    data: mixtapes,
  });
});

router.get("/allSavedMixtapes/:userId", async function (req, res) {
  const { userId } = req.params;
  const user = await User.findById(userId);
  console.log("saved mixtapes of a user", user.favorites);
  res.status(200).json({
    data: user.favorites,
  });
});

router.get("/mixtapeSavedCount/:mixtapeId", async function (req, res) {
  try {
    let saved = 0;
    const { mixtapeId } = req.params;
    // console.log(mixtapeId);
    const allUsers = await User.find();
    for (let user of allUsers) {
      for (let mixtape of user.favorites) {
        if (mixtape._id == mixtapeId) {
          saved = saved + 1;
          console.log(mixtape._id, mixtapeId);
        }
      }
    }
    res.status(200).json({
      data: saved,
    });
  } catch (err) {
    res.status(400).json({
      message: err.message,
    });
  }
});

router.get("/allMixtapes", async function (req, res) {
  let allMixtapes = await Mixtape.find();
  let all = [];
  allMixtapes.map(async (mixtape) => {
    console.log("all mixtapes in all mixtapes", mixtape);
    // const user = await User.findById(mixtape.userId);
    // console.log("user in all Mixtapes");
    // mixtape["profilename"] = user.name;
  });
  res.status(200).json({
    data: allMixtapes,
  });
});

router.get("/MixtapesAllTracks/:userId", async function (req, res) {
  const { userId } = req.params;
  let tracksUri = [];
  const mixtapes = await Mixtape.find({ spotifyUserId: userId });
  await mixtapes[0].tracks.map((track) => tracksUri.push(track.spotifyUri));
  console.log("tracksUri", tracksUri);
  res.status(200).json({
    data: tracksUri,
  });
});

router.post("/addtofavorite", async function (req, res) {
  const { mixtape, user } = req.body;
  console.log("mixtape to be saved", mixtape);
  console.log("Logged In user from Front end", user._id);
  const indiUser = await User.findById(user._id);
  console.log("IndiUser", indiUser);
  indiUser.favorites.push(mixtape);
  indiUser.save();
  res.status(200).json({
    message: "mixtape added to favorites",
  });
});

router.get("/search", async function (req, res) {
  const { mixtapeTitle } = req.body;
  const mixtape = await Mixtape.findOne({
    title: mixtapeTitle.toLowerCase().replace(/\s/g, ""),
  });
  if (!mixtape) {
    res.status(404).json({
      message: "mixtape not found",
    });
  }
  res.status(200).json({
    data: mixtape,
  });
});

module.exports = router;
