const express = require("express");
const mongoose = require("mongoose");
const userRoutes = require("./routes/mixtapeRoutes");
var querystring = require("querystring");
var request = require("request"); // "Request" library
var cors = require("cors");
require("dotenv").config();
var cookieParser = require("cookie-parser");

const { SpotifyApp } = require("./spotify");

const connect = mongoose.connect(process.env.DB_CONNECTION_STRING, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
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

// app.get("/login", function (req, res) {
//   var state = generateRandomString(16);
//   res.cookie(stateKey, state);

//   // your application requests authorization
//   var scope = "user-read-private user-read-email";
//   res.redirect(
//     "https://accounts.spotify.com/authorize?" +
//       querystring.stringify({
//         response_type: "code",
//         client_id: client_id,
//         scope: scope,
//         redirect_uri: redirect_uri,
//         state: state,
//       })
//   );
// });
// app.get("/callback", function (req, res) {
//   // your application requests refresh and access tokens
//   // after checking the state parameter

//   var code = req.query.code || null;
//   var state = req.query.state || null;
//   var storedState = req.cookies ? req.cookies[stateKey] : null;

//   if (state === null || state !== storedState) {
//     res.redirect(
//       "/#" +
//         querystring.stringify({
//           error: "state_mismatch",
//         })
//     );
//   } else {
//     res.clearCookie(stateKey);
//     var authOptions = {
//       url: "https://accounts.spotify.com/api/token",
//       form: {
//         code: code,
//         redirect_uri: redirect_uri,
//         grant_type: "authorization_code",
//       },
//       headers: {
//         Authorization:
//           "Basic " +
//           new Buffer(client_id + ":" + client_secret).toString("base64"),
//       },
//       json: true,
//     };

//     request.post(authOptions, function (error, response, body) {
//       console.log(error);
//       if (!error && response.statusCode === 200) {
//         var access_token = body.access_token,
//           refresh_token = body.refresh_token;

//         var options = {
//           url: "https://api.spotify.com/v1/me",
//           headers: { Authorization: "Bearer " + access_token },
//           json: true,
//         };

//         // use the access token to access the Spotify Web API
//         request.get(options, function (error, response, body) {
//           console.log(body);
//         });

//         // we can also pass the token to the browser to make requests from there
//         res.redirect(
//           "/#" +
//             querystring.stringify({
//               access_token: access_token,
//               refresh_token: refresh_token,
//             })
//         );
//       } else {
//         res.redirect(
//           "/#" +
//             querystring.stringify({
//               error: "invalid_token",
//             })
//         );
//       }
//     });
//   }
// });

// const scopes = [
//   "ugc-image-upload",
//   "user-read-playback-state",
//   "user-modify-playback-state",
//   "user-read-currently-playing",
//   "streaming",
//   "app-remote-control",
//   "user-read-email",
//   "user-read-private",
//   "playlist-read-collaborative",
//   "playlist-modify-public",
//   "playlist-read-private",
//   "playlist-modify-private",
//   "user-library-modify",
//   "user-library-read",
//   "user-top-read",
//   "user-read-playback-position",
//   "user-read-recently-played",
//   "user-follow-read",
//   "user-follow-modify",
// ];

app.use("/api/user", userRoutes);

module.exports = app;
