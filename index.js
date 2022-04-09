/**
 * This is an example of a basic node.js script that performs
 * the Authorization Code oAuth2 flow to authenticate against
 * the Spotify Accounts.
 *
 * For more information, read
 * https://developer.spotify.com/web-api/authorization-guide/#authorization_code_flow
 */
require('dotenv').config()
var express = require('express'); // Express web server framework
var request = require('request'); // "Request" library
var cors = require('cors');
var querystring = require('querystring');
var cookieParser = require('cookie-parser');
const mongoose = require("mongoose");
const User = require("./models/userModel");
const allPlaylists = require("./models/allPlaylistsModel")
const mixtapeRoutes = require("./routes/mixtapeRoutes");
const userRoutes = require("./routes/userRoutes");
const spotifyRoutes = require("./routes/spotifyRoutes");
const userModel = require('./models/userModel');
const login = require("./njtest/index")
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

var stateKey = 'spotify_auth_state';

var client_id =process.env.CLIENT_ID; // Your client id
var client_secret =process.env.CLIENT_SECRET;// Your secret
 
var app = express();
 
app.use(express.static(__dirname + '/public'))
  .use(cors())
  .use(express.json())
  .use(express.urlencoded({ extended: false }))
  .use(cookieParser())


 app.use("/api/spotify",spotifyRoutes)
 app.use("/api/mixtape", mixtapeRoutes);
 app.use("/api/user",userRoutes)
 
 console.log('Listening on 8888');
 app.listen(8888);