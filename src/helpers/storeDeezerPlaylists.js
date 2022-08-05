require("dotenv").config();
var request = require("request");
var axios = require("axios");

async function storeDeezerPlaylists(allDeezerPlaylists) {
  let userPlaylists = await allDeezerPlaylists.data.map((playlist) => ({
    playlistName: playlist.title,
    playlistId: playlist.id,
    playlistImage: playlist.picture
      ? playlist.picture
      : "https://pbs.twimg.com/profile_images/558556141605511168/2JDJX8SQ_400x400.png",
    playlistOwner: playlist.creator.name,
    playlistTracks: playlist.tracklist,
    noOfTracks: playlist.nb_tracks,
    duration: playlist.duration,
  }));
  for (playlists of userPlaylists) {
    let allTracks = [];
    await axios.get(`${playlists.playlistTracks}`).then(async (res) => {
      const trackList = res.data.data;
      let _allTracks = await trackList.map((track) => ({
        added_at: track.time_add,
        title: track.title,
        duration: track.duration,
        image: track.md5_image,
        albumName: track.album.title,
        artists: track.artist.name,
        uri: track.id,
        type: "deezer",
      }));
      playlists["Tracks"] = _allTracks;
    });
  }
  return userPlaylists;
}

module.exports = { storeDeezerPlaylists: storeDeezerPlaylists };

// console.log(userPlaylists);
// await axios.get(`${playlist.tracklist}`).then(async (res) => {
//   const trackList = res.data.data;
//   // console.log(res.data);
//   const alltracks = trackList.map(async (track) => {
//     let _allTracks = {
//       added_at: track.time_add,
//       title: track.title,
//       duration: track.duration,
//       image: track.md5_image,
//       albumName: track.album.title,
//       artists: track.artist.name,
//     };
//     // await axios
//     //   .get(`https://api.deezer.com/track/${track.id}`)
//     //   .then(async (res) => {
//     //     console.log(res.data.isrc);
//     //     _allTracks["link"] = await res.data.isrc;
//     //   });
//   });
//   userPlaylists["Tracks"] = await alltracks;
// });
// }
