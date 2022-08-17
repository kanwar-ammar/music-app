const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const user = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  image: {
    type: String,
  },
  deezerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "deezerUser",
  },
  spotifyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "spotifyUser",
  },
  followers: {
    type: Array,
  },
  following: {
    type: Array,
  },
  favorites: {
    type: Array,
  },
  totalMixtapes: {
    type: Number,
  },
  totalListens: {
    type: Number,
  },
});

module.exports = mongoose.model("user", user);
