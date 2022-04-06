/**
 * This is an example of a basic node.js script that performs
 * the Authorization Code oAuth2 flow to authenticate against
 * the Spotify Accounts.
 *
 * For more information, read
 * https://developer.spotify.com/web-api/authorization-guide/#authorization_code_flow
 */

 var express = require('express'); // Express web server framework
 var request = require('request'); // "Request" library
 var cors = require('cors');
 var querystring = require('querystring');
 var cookieParser = require('cookie-parser');
 
var client_id ='a8bad90b454c4ab59b68b38fe1836c2a'; // Your client id
var client_secret ='7c110aca67fe4d15a063be6103f9f3d9';// Your secret
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
 
 var stateKey = 'spotify_auth_state';
 
 var app = express();
 
 app.use(express.static(__dirname + '/public'))
    .use(cors())
    .use(cookieParser());
 
    // http://localhost:8888/login
 app.get('/login', function(req, res) { //return code=can be exchanged for access token and state= protection 
 
   var state = generateRandomString(16);
    console.log(state,"state")
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

 let userid;
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
 
         var options = {
           url: 'https://api.spotify.com/v1/me',
           headers: { 'Authorization': 'Bearer ' + access_token },
           json: true
         };
         // use the access token to access the Spotify Web API
        request.get(options, function(error, response, body) {
           console.log("user all details",body);
           userid = body.id
           console.log("user id in Authorization",userid)
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
 

 app.get('/refresh_token', function(req, res) {
 
   // requesting access token from refresh token
   var refresh_token = req.query.refresh_token;
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
       console.log(access_token)
       res.send({
         'access_token': access_token
       });
     }
   });
 });

let allTracks =[]
 //http://localhost:8888/userPlaylists => to get playlists of userrr by user id and access token
 app.get("/userPlaylists",function(req,res){
  var url = 'https://api.spotify.com/v1/users/'+userid+'/playlists'
  console.log("url in userPlaylits",url)
  var authOptions = {
    url: 'https://api.spotify.com/v1/users/'+userid+'/playlists',
    headers: { 'Authorization': 'Bearer ' + access_token  },
    json: true
  };
  // console.log(authOptions)

  request.get(authOptions, function(error, response, body) {
    if (!error && response.statusCode === 200) {
      const userPlaylists=body.items
      console.log("All playlists",userPlaylists)
      userPlaylists.map(function(a){
        const playlistId = a.id
        const getTracks ={
        url: "https://api.spotify.com/v1/playlists/"+playlistId+"/tracks",
        headers: { 'Authorization': 'Bearer ' + access_token  },
        json: true
        }
        request.get(getTracks,function(error, response, body){
          if (!error && response.statusCode === 200) {
            console.log("All tracks in a playlist",body)
            const _allTracks = body.items
            _allTracks.map(track => allTracks.push(track.track))
            console.log("tracks",_allTracks)
            console.log("total All tracks",allTracks)
            console.log("total All tracks",allTracks.length)
          }
        })
      })
    }
  });
 })

 //http://localhost:8888/userPlaylists => to get playlists of userrr by user id and access token
//  app.get("/userPlaylistsTracks",function(req,res){
//   var url = 'https://api.spotify.com/v1/users/'+userid+'/playlists'
//   console.log("url in userPlaylits",url)
//   var authOptions = {
//     url: 'https://api.spotify.com/v1/users/'+userid+'/playlists',
//     headers: { 'Authorization': 'Bearer ' + access_token  },
//     json: true
//   };
//   // console.log(authOptions)

//   request.get(authOptions, function(error, response, body) {
//     if (!error && response.statusCode === 200) {
//       console.log("userPlaylists",body)
//       res.send({
//         'user': body
//       });
//     }
//   });
//  })


 
 console.log('Listening on 8888');
 app.listen(8888);