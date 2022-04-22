const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const mixtapes = new Schema({
  title: {
    type: String,
    required: true,
    lowercase: true,
  },
  imgsrc: {
    type: String,
  },
  spotifyUserId: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  tracks: {
    type: Array,
    required: true,
  },
});

module.exports = mongoose.model("mixtapes", mixtapes);
