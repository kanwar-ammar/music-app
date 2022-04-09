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
   "mongodb://localhost:27017/music-app",
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
 var redirect_uri= 'http://localhost:8888/callback';// Your redirect uri
  
  /**
   * Generates a random string containing numbers and letters
   * @param  {number} length The length of the string
   * @return {string} The generated string
   */
  var generateRandomString = function(length) {
    var text = '';
    var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  
    for (var i = 0; i < length; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  };
  
 var app = express();
  
 app.use(express.static(__dirname + '/public'))
   .use(cors())
   .use(express.json())
   .use(cookieParser())
 
     http://localhost:8888/login
  app.get('/login', function(req, res) { //return code=can be exchanged for access token and state= protection 
  
    var state = generateRandomString(16);
     // console.log(state,"state")
    res.cookie(stateKey, state);
  
    // your application requests authorization
    // what we will be needing from a user
    var scope = 'user-read-private user-read-email user-modify-playback-state user-read-playback-position user-library-read streaming user-read-playback-state user-read-recently-played playlist-read-private';
    res.redirect('https://accounts.spotify.com/authorize?' +
      querystring.stringify({
        response_type: 'code',
        client_id: client_id,
        scope: scope,
        redirect_uri: redirect_uri,
        state: state
      }));
  }); 
 
  let access_token;
  
  app.get('/callback', function(req, res) {
    // your application requests refresh and access tokens
    // after checking the state parameter
  
    var code = req.query.code || null; 
    var state = req.query.state || null;
    var storedState = req.cookies ? req.cookies[stateKey] : null; 
  
    if (state === null || state !== storedState) {
      res.redirect('/#' +
        querystring.stringify({
          error: 'state_mismatch'
        }));
    } else {
      res.clearCookie(stateKey);
      var authOptions = {
        url: 'https://accounts.spotify.com/api/token',
        form: {
          code: code,
          redirect_uri: redirect_uri,
          grant_type: 'authorization_code'
        },
        headers: {
          'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64'))
        },
        json: true
      };
  
      request.post(authOptions, function(error, response, body) {
        if (!error && response.statusCode === 200) {
              access_token = body.access_token,
              refresh_token = body.refresh_token;
 
              console.log(body)
              
              var options = {
                url: 'https://api.spotify.com/v1/me',
                headers: { 'Authorization': 'Bearer ' + access_token },
                json: true
          };
          // use the access token to access the Spotify Web API
         request.get(options, function(error, response, body) {
           console.log("user all details",body);
           const userId = body.display_name.toLowerCase()
 
           // save user data here
           const user = new User({
             userSpotifyId:body.id,
             name:body.display_name,
             userId:"@"+userId.replace(/\s/g, ''),
             spotifyAccessToken:access_token,
             spotifyRefreshToken:refresh_token
           })
           console.log(user)
           user.save()
           req.user = user
           /////////
           console.log(access_token)
           console.log("req.user",req.user)
          });
          
          // we can also pass the token to the browser to make requests from there
          res.redirect('/#' +
            querystring.stringify({
              access_token: access_token,
              refresh_token: refresh_token
            }));
        } else {
          res.redirect('/#' +
            querystring.stringify({
              error: 'invalid_token'
            }));
        }
      });
    }
  });
  
 
  app.get('/refresh_token', async function(req, res) {
   const {userId} = req.body
   const user = await User.findOne({userSpotifyId:userId})
   // const access_tokenin = user.spotifyAccessToken
    console.log("inside refresh token")
  
    // requesting access token from refresh token
    var refresh_token = user.spotifyRefreshToken;
    console.log("the refresh token",refresh_token)
    var authOptions = {
      url: 'https://accounts.spotify.com/api/token',
      headers: { 'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64')) },
      form: {
        grant_type: 'refresh_token',
        refresh_token: refresh_token
      },
      json: true
    };
  
    request.post(authOptions, function(error, response, body) {
      if (!error && response.statusCode === 200) {
        var access_token = body.access_token;
        console.log(body)
        res.send({
          'access_token': access_token
        });
      }
    });
  });
 
  
  //http://localhost:8888/userPlaylists => to get playlists of userrr by user id and access token
 app.get("/userPlaylists",async function(req,res){
   console.log("req.user",req.user)
   const {userId} = req.body
   const user = await User.findOne({userSpotifyId:userId})
   var access_tokenin = user.spotifyAccessToken
   const refresh_token = user.spotifyRefreshToken
 
 //  if uncommenting this also uncomment the timeout function below
     //  var authOptions = {
     //   url: 'https://accounts.spotify.com/api/token',
     //   headers: { 'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64')) },
     //   form: {
     //     grant_type: 'refresh_token',
     //     refresh_token: refresh_token
     //   },
     //   json: true
     // };
 
     // request.post(authOptions, function(error, response, body) {
     //   if (!error && response.statusCode === 200) {
     //     var access_token = body.access_token;
     //     access_tokenin = access_token
     //   }
     // })
 
   let allTracks =[] //all tracks of user with their respective playlists are stored here
   // setTimeout(function(){
     var authOptions = {
       url: 'https://api.spotify.com/v1/users/'+userId+'/playlists',
       headers: { 'Authorization': 'Bearer ' + access_tokenin  },
       json: true
     };
   request.get(authOptions,function(error, response, body) {
     console.log("inside function",access_tokenin)
     console.log("first body",body)
     if (!error && response.statusCode === 200) {
       const userPlaylists=body.items
       console.log("All playlists",userPlaylists)
       userPlaylists.map(function(playlist){
         const playlistId = playlist.id
         const getTracks ={
           url: "https://api.spotify.com/v1/playlists/"+playlistId+"/tracks",
           headers: { 'Authorization': 'Bearer ' + access_tokenin  },
           json: true
         }
         request.get(getTracks,function(error, response, body){
           console.log("second body",body)
           if (!error && response.statusCode === 200) {
             const _allTracks = body.items
             allTracks.push({
               playlistId:playlistId,
               Tracks:_allTracks
             })
           }
         });
         console.log("all tracks",allTracks)
       })
     }
   })
 // },1000)
   setTimeout(function(){
     console.log("All tracks",allTracks)
     const allUserPlaylists = new allPlaylists({
       userId:userId,
       Playlists:allTracks
     })
     console.log(allUserPlaylists)
     allUserPlaylists.save()
     res.send({
       "message":"done"
     })
   },3000)
   })
 
  app.use("/api/spotify",spotifyRoutes)
  app.use("/api/mixtape", mixtapeRoutes);
  app.use("/api/user",userRoutes)
  
  console.log('Listening on 8888');
  app.listen(8888);