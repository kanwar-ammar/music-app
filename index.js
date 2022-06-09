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

 
 //coommented function from spotifyRoutes.js
// router.post("/userinfo/:access_token", function (req, res) {
//   var redirect_uri = "http://18.132.114.99:8888/api/spotify/callback"; // Your redirect uri
//   var authOptions = {
//     url: "https://accounts.spotify.com/api/token",
//     form: {
//       code: code,
//       redirect_uri: redirect_uri,
//       grant_type: "authorization_code",
//     },
//     headers: {
//       Authorization:
//         "Basic " +
//         new Buffer(client_id + ":" + client_secret).toString("base64"),
//     },
//     json: true,
//   };

//   var { access_token } = req.params;
//   var options = {
//     url: "https://api.spotify.com/v1/me",
//     headers: { Authorization: "Bearer " + access_token },
//     json: true,
//   };
//   request.post(authOptions,validateToken.validateToken(access_token), function (error, response, body) {
//     console.log("body in token", body);
//     if (!error && response.statusCode === 200) {
//       (access_token = body.access_token), (refresh_token = body.refresh_token);
//     }
//   });

//   // request.get(options, async function (error, response, body) {
//   //   console.log("body in userinfo", body);
//   // });
//   // console.log("accesstoken in userinfo", access_token);
//   // var options = {
//   //   url: "https://api.spotify.com/v1/me",
//   //   headers: { Authorization: "Bearer " + access_token },
//   //   json: true,
//   // };
//   // use the access token to access the Spotify Web API
//   request.get(options, async function (error, response, body) {
//     console.log("bosy in userinfo", body);
//     if (body.error) {
//       if (body.error.message === "The access token expired") {
//         const user = await User.findOne({ spotifyAccessToken: access_token });
//         console.log("user in userinfo", user);
//         const userId = user.userSpotifyId;
//         res.redirect(`/api/spotify/refresh_token/${userId}`);
//       }
//     } else {
//       const userId = body.display_name.toLowerCase();
//       const userSpotifyId = body.id;
//       const spotifyUser = await User.findOne({ userSpotifyId });
//       if (spotifyUser) {
//         spotifyUser.spotifyAccessToken = access_token;
//         spotifyUser.save();
//         console.log(spotifyUser);
//         // res.redirect('http://music-webapp.s3-website.eu-west-2.amazonaws.com/dashboard')
//         res.send({
//           data: spotifyUser,
//         });
//       } else {
//         //  save user data here
//         const user = new User({
//           userSpotifyId: userSpotifyId,
//           name: body.display_name,
//           email: body.email,
//           userId: "@" + userId.replace(/\s/g, ""),
//           spotifyAccessToken: access_token,
//           spotifyRefreshToken: refresh_token,
//         });
//         console.log("saved user in database", user);
//         user.save();
//         req.user = user;
//         ///////
//         res.redirect(
//           "/http://music-webapp.s3-website.eu-west-2.amazonaws.com/dashboard"
//         );
//       }
//     }
//   });
// });