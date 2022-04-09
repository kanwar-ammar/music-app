const mongoose = require("mongoose")

const Schema = mongoose.Schema

const user = new Schema({
    userSpotifyId: {
        type: String,
        required: true      
    },
    name:{
        type: String,
        required: true 
    },
    userId:{
        type: String,
        required: true
    },
    spotifyAccessToken:{
        type: String,
        required: true
    },
    spotifyRefreshToken:{
        type: String,
        required: true
    },
    followers:{
        type:Array,
    },
    following:{
        type:Array,
    },
    totalMixtapes:{
        type:Number   
    },
    totalListens:{
        type:Number
    }
})

module.exports = mongoose.model('user', user);