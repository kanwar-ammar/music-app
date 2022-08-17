const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const spotifyUser = new Schema({
  userSpotifyId: {
    type: String,
  },
  name: {
    type: String,
  },
  email: {
    type: String,
  },
  image: {
    type: String,
  },
  spotifyAccessToken: {
    type: String,
  },
  spotifyRefreshToken: {
    type: String,
  },
});

module.exports = mongoose.model("spotifyUser", spotifyUser);
