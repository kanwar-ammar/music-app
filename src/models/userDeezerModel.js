const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const deezerUser = new Schema({
  userDeezerId: {
    type: String,
    // required: true,
  },
  deezerImage: {
    type: String,
    // required: true,
  },
  deezerAccessToken: {
    type: String,
    // required: true,
  },
  deezerRefreshToken: {
    type: String,
    // required: true,
  },
  deezerEmail: {
    type: String,
  },
});

module.exports = mongoose.model("deezerUser", deezerUser);
