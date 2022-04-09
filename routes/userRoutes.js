const express = require("express");
var router = express.Router();
const User = require("../models/userModel");

router.post("/follow",async function(req,res){
    console.log("follow")
    const {userId} = req.body
    const user = await User.findOne({userId})
    user.followers.push("a user")
    user.save()
    res.status(200).json({
        user
    })
})

module.exports = router;