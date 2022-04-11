const express = require("express")
var router = express.Router()
require('dotenv').config()
var request = require('request');
var querystring = require('querystring');
const User = require("../models/userModel");
const allPlaylists = require("../models/allPlaylistsModel")

var stateKey = 'spotify_auth_state';

var client_id =process.env.CLIENT_ID; // Your client id
var client_secret =process.env.CLIENT_SECRET;// Your secret
var redirect_uri= 'http://localhost:8888/api/spotify/callback';// Your redirect uri

var generateRandomString = function(length) {
    var text = '';
    var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  
    for (var i = 0; i < length; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  };
  router.get('/login', function(req, res) { //return code=can be exchanged for access token and state= protection 
 
    var state = generateRandomString(16);
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
  
  router.get('/callback', function(req, res) {
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
         request.get(options, async function(error, response, body) {
          const userId = body.display_name.toLowerCase()
          const userSpotifyId = body.id
          const spotifyUser = await User.findOne({userSpotifyId})
          if (spotifyUser){
            console.log("user is already registered, access token replaced")
            spotifyUser.spotifyAccessToken = access_token
            spotifyUser.save()
            res.redirect('http://music-webapp.s3-website.eu-west-2.amazonaws.com/dashboard')
          }else{
          //  save user data here
           const user = new User({
             userSpotifyId:userSpotifyId,
             name:body.display_name,
             email:body.email,
             userId:"@"+userId.replace(/\s/g, ''),
             spotifyAccessToken:access_token,
             spotifyRefreshToken:refresh_token
           })
           console.log("saved user in database",user)
           user.save()
           req.user = user
           ///////
           res.redirect('/http://music-webapp.s3-website.eu-west-2.amazonaws.com/dashboard');
          }
          });


        } else {
          res.redirect('/#' +
            querystring.stringify({
              error: 'invalid_token'
            }));
        }
      });
    }
  });



router.get("/userPlaylists",async function(req,res){
    const {userId} = req.body
    const user = await User.findOne({userSpotifyId:userId})
    var access_tokenin = user.spotifyAccessToken
    const refresh_token = user.spotifyRefreshToken
  
    let allTracks =[] //all tracks of user with their respective playlists are stored here
      var authOptions = {
        url: 'https://api.spotify.com/v1/users/'+userId+'/playlists',
        headers: { 'Authorization': 'Bearer ' + access_tokenin  },
        json: true
      };
    request.get(authOptions,function(error, response, body) {
      if (!error && response.statusCode === 200) {
        const userPlaylists=body.items
        userPlaylists.map(function(playlist){
          const playlistId = playlist.id
          const getTracks ={
            url: "https://api.spotify.com/v1/playlists/"+playlistId+"/tracks",
            headers: { 'Authorization': 'Bearer ' + access_tokenin  },
            json: true
          }
          request.get(getTracks,function(error, response, body){
            if (!error && response.statusCode === 200) {
              const _allTracks = body.items
              allTracks.push({
                playlistId:playlistId,
                Tracks:_allTracks
              })
            }
          });
          // console.log("all tracks",allTracks)
        })
      }
    })
    setTimeout(function(){
      const allUserPlaylists = new allPlaylists({
        userId:userId,
        Playlists:allTracks
      })
      allUserPlaylists.save()
      console.log("all playlists with tracks saved",allUserPlaylists)
      res.status(200).json({
        "message":"done"
      })
    },3000)
    })


router.get('/refresh_token', async function(req, res) {
  const {userId} = req.body
  const user = await User.findOne({userSpotifyId:userId})
  
    // requesting access token from refresh token
    var refresh_token = user.spotifyRefreshToken;
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
        res.send({
          'access_token': access_token
        });
      }
    });
  });


module.exports =router