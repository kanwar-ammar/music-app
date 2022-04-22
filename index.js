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
var cookieParser = require('cookie-parser');
const mongoose = require("mongoose");
const mixtapeRoutes = require("./routes/mixtapeRoutes");
const userRoutes = require("./routes/userRoutes");
const spotifyRoutes = require("./routes/spotifyRoutes");
const appleRoutes = require("./routes/appleRoutes");
var request = require('request');
const jwt = require("jsonwebtoken");

var app = express();

// var allowlist = ['http://localhost:8888/api/spotify/login', 'http://example2.com']
// var corsOptionsDelegate = function (req, callback) {
//   var corsOptions;
//   if (allowlist.indexOf(req.header('Origin')) !== -1) {
//     corsOptions = { origin: true } // reflect (enable) the requested origin in the CORS response
//   } else {
//     corsOptions = { origin: false } // disable CORS for this request
//   }
//   callback(null, corsOptions) // callback expects two parameters: error and options
// }
 
app.use(express.static(__dirname + '/public'))
  .use(cors())
  .use(express.json())
  .use(express.urlencoded({ extended: false }))
  .use(cookieParser())

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
 
 app.use("/api/spotify",spotifyRoutes)
 app.use("/api/mixtape", mixtapeRoutes);
 app.use("/api/user",userRoutes)
 app.use("/api/apple",appleRoutes)

const fs = require("fs");
 
 console.log('Listening on 8888');
 app.listen(8888);