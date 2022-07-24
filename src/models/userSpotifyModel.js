const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const spotifyUser = new Schema({
  userSpotifyId: {
    type: String,
    // required: true,
  },
  name: {
    type: String,
  },
  email: {
    type: String,
  },
  image: {
    type: String,
    // required: true,
  },
  spotifyAccessToken: {
    type: String,
    // required: true,
  },
  spotifyRefreshToken: {
    type: String,
    // required: true,
  },
});

module.exports = mongoose.model("spotifyUser", spotifyUser);
