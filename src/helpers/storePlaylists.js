require("dotenv").config();
var request = require("request");
var axios = require("axios");
const User = require("../models/userModel");
const allPlaylists = require("../models/allPlaylistsModel");
async function storePlaylists(userPlaylists, access_tokenin, req, res, next) {
  let allTracks = []; //all tracks of user with their respective playlists are stored here
  const allUserPlaylists = await userPlaylists.map((playlist) => ({
    playlistName: playlist.name,
    playlistId: playlist.id,
    playlistImage: playlist.images[0]
      ? playlist.images[0].url
      : "https://pbs.twimg.com/profile_images/558556141605511168/2JDJX8SQ_400x400.png",
    noOfTracks: playlist.tracks.total,
    playlistOwner: playlist.owner.display_name,
  }));

  // const getTracks = {
  //   url:
  //     "https://api.spotify.com/v1/playlists/" + playlistId + "/tracks",
  //   headers: { Authorization: "Bearer " + access_tokenin },
  //   json: true,
  // };
  // request.get(getTracks,async function (error, response, body) {
  //   //   console.log("items in store Playlists",body)
  //   if (!error && response.statusCode === 200) {
  //     let _allTracks = [];
  //      body.items.map((track) => {
  //       _allTracks.push({
  //         added_at: track.added_at,
  //         title: track.track.name,
  //         duration: track.track.duration_ms,
  //         image: track.track.album.images[0].url,
  //         albumName: track.track.album.name,
  //         artists: track.track.artists.map((a) => a.name),
  //         spotifyUri: track.track.uri,
  //       });
  //     });
  //   //   console.log("_allTracks in store Playlists",_allTracks)
  //   await allTracks.push({
  //       playlistName: playlistName,
  //       playlistId: playlistId,
  //       playlistOwner: playlistOwner,
  //       playlistImage: playlistImage,
  //       noOfTracks: noOfTracks,
  //       Tracks: _allTracks,
  //     });

  //   }
  // });
  //   console.log(allTracks)

  for (x in allUserPlaylists) {
    let _allTracks = [];
    await axios
      .get(
        "https://api.spotify.com/v1/playlists/" +
          allUserPlaylists[x].playlistId +
          "/tracks",
        {
          headers: { Authorization: "Bearer " + access_tokenin },
        }
      )
      .then(async (res) => {
        let _allTracks = await res.data.items.map((track) => ({
          added_at: track.added_at,
          title: track.track.name,
          duration: track.track.duration_ms,
          image: track.track.album.images[0].url,
          albumName: track.track.album.name,
          artists: track.track.artists.map((a) => a.name),
          uri: track.track.uri,
        }));
        allTracks.push((allUserPlaylists[x].Tracks = _allTracks));
      });
  }
  //   console.log(allTracks)
  // console.log("all user playlists inside store Playlists",allUserPlaylists)
  console.log(allUserPlaylists);
  return allUserPlaylists;

  // return allTracks
  //     setTimeout(function () {
  //       const allUserPlaylists = new allPlaylists({
  //         userId: userId,
  //         Playlists: allTracks,
  //       });
  //       allUserPlaylists.save();
  //       console.log("all playlists with tracks saved", allUserPlaylists);
  //       res.status(200).json({
  //         data: allUserPlaylists,
  //       });
  //     }, 3000);
}

module.exports = {
  storePlaylists: storePlaylists,
};
