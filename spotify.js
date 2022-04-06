var SpotifyWebApi = require("spotify-web-api-node");

class SpotifyApp {
  spotify = new SpotifyWebApi({
    clientId: this.clientId,
    clientSecret: this.clientSecret,
    redirectUri: this.redirectUri,
  });
  clientId = "";
  clientSecret = "";
  redirectUri = "";
  createAuthorizeURL = null;
  accessToken = "";
  refreshToken = "";
  expiresIn = null;
  constructor({ clientId, clientSecret, redirectUri }) {
    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.redirectUri = redirectUri;
    this.spotify = new SpotifyWebApi({
      clientId,
      clientSecret,
      redirectUri,
    });
  }

  setToken = ({ access_token, refresh_token, expires_in }) => {
    this.accessToken = access_token;
    this.refreshToken = refresh_token;
    this.expiresIn = expires_in;
    this.spotify.setAccessToken(access_token);
    this.spotify.setRefreshToken(refresh_token);
  };

  getData = () =>
    new Promise(async (resolve, reject) => {
      try {
        if (!this.spotify)
          reject({ message: "SpotifyApp has not been initialized yet!" });
        console.log(this.spotify);
        const me = await this.spotify.getMe();
        console.log(me.body);
        let playlist = await this.getUserPlayList(me.body.id);
        resolve({ me, playlist });
      } catch (error) {
        // console.log(error);
        reject(error);
      }
    });

  getUserPlayList = (userName) =>
    new Promise(async (resolve, reject) => {
      try {
        if (!this.spotify)
          reject({ message: "SpotifyApp has not been initialized yet!" });
        const data = await this.spotify.getUserPlaylists(userName);
        let playlists = [];
        for (let playlist of data.body.items) {
          // console.log(playlist.name + " " + playlist.id);

          let tracks = await this.getPlaylistTracks(playlist.id, playlist.name);
          playlists.push({
            playlist,
            tracks,
          });
          // console.log(tracks);

          // const tracksJSON = { tracks };
          // let data = JSON.stringify(tracksJSON);
          // fs.writeFileSync(playlist.name + ".json", data);
        }
        resolve(playlists);
      } catch (error) {
        reject(error);
      }
    });

  getPlaylistTracks = (playlistId, playlistName) => {
    return new Promise(async (resolve, reject) => {
      try {
        if (!this.spotify)
          reject({ message: "SpotifyApp has not been initialized yet!" });
        const data = await this.spotify.getPlaylistTracks(playlistId, {
          offset: 0,
          limit: 100,
          fields: "items",
        });

        let tracks = [];

        for (let track_obj of data.body.items) {
          const track = track_obj.track;
          tracks.push(track);
          // console.log(track.name + " : " + track.artists[0].name);
        }

        // console.log("---------------+++++++++++++++++++++++++");
        resolve(tracks);
      } catch (error) {
        reject(error);
      }
    });
  };
}

module.exports = {
  SpotifyApp,
};
