const express = require("express");
const mongoose = require("mongoose");
const userRoutes = require("./routes/mixtapeRoutes");
var querystring = require("querystring");
var request = require("request"); // "Request" library
var cors = require("cors");
require("dotenv").config();
var cookieParser = require("cookie-parser");

const { SpotifyApp } = require("./spotify");

const connect = mongoose.connect(
  process.env.DB_CONNECTION_STRING,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);
connect.then(
  (db) => {
    console.log("Connected correctly to server");
  },
  (err) => {
    console.log(err);
  }
);

var app = express();

app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get("/send", (req, res) => {
  res.send("Hello, I am Music Backend");
});

/**
 * Generates a random string containing numbers and letters
 * @param  {number} length The length of the string
 * @return {string} The generated string
 */
// var generateRandomString = function (length) {
//   var text = "";
//   var possible =
//     "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

//   for (var i = 0; i < length; i++) {
//     text += possible.charAt(Math.floor(Math.random() * possible.length));
//   }
//   return text;
// };

// var stateKey = "spotify_auth_state";

var app = express();

app
  .use(express.static(__dirname + "/public"))
  .use(cors())
  .use(cookieParser());



app.use("/api/user", userRoutes);

module.exports = app;
