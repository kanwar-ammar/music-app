const express = require("express");
require('dotenv').config()
var router = express.Router()
const User = require("../models/userModel");
var request = require('request');
const jwt = require("jsonwebtoken");
const fs = require("fs");

const private_key = fs.readFileSync("key.p8").toString()
const team_id = "GTFQ6JTX54";
const key_id = "SBDJ7Q56A7";

const token = jwt.sign({}, private_key, {
  algorithm: "ES256",
  expiresIn: "180d",
  keyid: key_id,
  issuer: team_id,
  header: {
    alg: "ES256",
    kid: key_id,
  },
});

router.get("/token", function (req, res) {
  
  res.setHeader("Content-Type", "application/json");
  res.send(JSON.stringify({ token: token }));
  
});

router.get("/login", function (req, res) {
    var options = {
        url: 'https://api.music.apple.com/v1/catalog/us/artists/462006?relate=playlists',
        // url: 'https://api.music.apple.com/v1/me/library',
        headers: { 'Authorization': 'Bearer ' + token },
        json: true
    }
    request.get(options, async function(error, response, body) {
        console.log(body)
        res.send({
            body
        })
    })
      
  });


module.exports = router