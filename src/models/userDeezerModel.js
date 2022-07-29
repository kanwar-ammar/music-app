const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const deezerUser = new Schema({
  userDeezerId: {
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
  deezerAccessToken: {
    type: String,
    // required: true,
  },
  deezerRefreshToken: {
    type: String,
    // required: true,
  },
});

module.exports = mongoose.model("deezerUser", deezerUser);
