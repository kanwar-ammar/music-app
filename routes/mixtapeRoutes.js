const express = require("express");
var router = express.Router();
const Mixtape = require("../models/mixtapeModel");

router.post("/createMixtape",async function(req,res){
  console.log(req.body)
  const {title,description,tracks} = req.body
  const newMixtape = new Mixtape({
   title:title,
   description:description,
   tracks:tracks
  })
  newMixtape.save()
  res.json({
    "message":"new mixtape created"
  })
})

module.exports = router;