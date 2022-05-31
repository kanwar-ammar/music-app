const express = require("express");
var router = express.Router();
const Mixtape = require("../models/mixtapeModel");
const User = require("../models/userModel");

router.post("/createMixtape/:spotifyUserId", async function (req, res) {
  console.log(req.body);
  const { spotifyUserId } = req.params;
  const { title, description, tracks, imgsrc } = req.body;
  const newMixtape = new Mixtape({
    title: title.replace(/\s/g, ""),
    imgsrc: imgsrc ? imgsrc : tracks[0].image,
    description: description,
    tracks: tracks,
    spotifyUserId: spotifyUserId,
  });
  newMixtape.save();
  res.status(200).json({
    message: "new mixtape created",
  });
});

router.get("/allUserMixtapes/:userId", async function (req, res) {
  const { userId } = req.params;
  const mixtapes = await Mixtape.find({ spotifyUserId: userId });
  res.status(200).json({
    data: mixtapes,
  });
});

router.get("/allSavedMixtapes/:userId", async function (req, res) {
  const { userId } = req.params;
  const user = await User.findOne({ userSpotifyId: userId });
  res.status(200).json({
    data: user.favorites,
  });
});

router.get("/allMixtapes", async function (req, res) {
  let allMixtapes = await Mixtape.find();
  let all = [];
  allMixtapes.map(async (mixtape) => {
    const user = await User.findOne({ userSpotifyId: mixtape.spotifyUserId });
    mixtape["profilename"] = user.name;
    // console.log(mixtape);
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
  console.log("Logged In user from Front end", user.userSpotifyId);
  const indiUser = await User.findOne({ userSpotifyId: user.userSpotifyId });
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
