const mongoose =require("mongoose")

const Schema  = mongoose.Schema

const allPlaylists =new Schema({
    userId:{
        type:String,
        required:true
    },
    Playlists:{
        type:Array,
        required:true
    }
})

module.exports = mongoose.model('allPlaylists', allPlaylists);