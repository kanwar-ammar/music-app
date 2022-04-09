const express = require("express");
var router = express.Router();
const Mixtape = require("../models/mixtapeModel");


const allTracks=[]

router.post("/createMixtape",async function(req,res){
  console.log(req.body)
  const {title,description} = req.body
  const newMixtape = new Mixtape({
   title:title,
   description:description,
   tracks:allTracks
  })
  newMixtape.save()
  res.json({
    newMixtape
  })
})

module.exports = router;