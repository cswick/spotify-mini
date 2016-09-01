import Spotify from './Spotify';
import robot from 'robotjs';
import ActionTypes from './ActionTypes';
import BTWrapper from './BTWrapper';

declare var window;

class Player implements BowtiePlayer {

  constructor(theme: BowtiePlist) {
    //document.addEventListener('click', this.handleClick, false);

    if (theme.BTStatusFunction) {
      setInterval(() => {
        window[theme.BTStatusFunction]();
      }, 1000);
    }

    if (theme.BTTrackFunction) {
      Spotify.on(ActionTypes.READY, () => {
        window[theme.BTTrackFunction](this.currentTrack());
      });
      Spotify.on(ActionTypes.TRACK_CHANGE, () => {
        window[theme.BTTrackFunction](this.currentTrack());
      });
    }

    if (theme.BTArtworkFunction) {
      Spotify.on(ActionTypes.ART_UPDATE, () => {
        window[theme.BTArtworkFunction](this.renderedArtwork());
      });
    }

    Spotify.onAny((event, value) => {
      console.log(`${event}`);
      if (value) {
        try {
          console.log(`${value.track.artist_resource.name} - ${value.track.track_resource.name}`);
        } catch(e) {}
      }
    });
    Spotify.on('READY', () => {
      // setInterval(() => {
      //   console.log(Spotify.getPosition());
      // }, 250);
    });
  }

  handleClick(e) {
    switch (e.target.id) {
      case 'play':
        Spotify.play();
        e.target.id = 'pause';
        break;
      case 'prev':
        robot.keyTap('audio_prev');
        break;
      case 'next':
        robot.keyTap('audio_next');
        break;
      case 'pause':
        Spotify.pause();
        e.target.id = 'play';
        break;
    }
    console.log(e.target);
  }

  isConnected() {};
  nextTrack() {
    robot.keyTap('audio_next');
  };
  pause() {};
  play() {};
  playerPosition() {
    return Spotify.status.playing_position;
  };
  playPause() {
    Spotify.togglePlayPause();
  };
  playState() {
    if (Spotify.status.playing) return 1;
    return Spotify.status.playing_position === 0 ? 0: 2;
  };
  previousTrack() {
    robot.keyTap('audio_prev');
  };
  setPlayerPosition() {};
  setVolume() {};
  stop() {};
  volume() {};

  //Track Information
  currentTrack() {
    return new BTWrapper({
       title: Spotify.status.track.track_resource.name,
       artist: Spotify.status.track.artist_resource.name,
       album: Spotify.status.track.album_resource.name,
       genre: '',
       length: Spotify.status.track.length
    });
  };
  rating() {};
  ratingStars() {};
  renderedArtwork() {
    return Spotify.artworkUrl;
  };
  setRating() {};
  uniqueString() {};

  //Shuffle and Repeat
  repeat() {};
  setRepeat() {};
  setShuffle() {};
  shuffle() {};

  //Presentation Methods
  canShow() {};
  name() {};
  show() {};

  //Deprecated Methods
  artwork() {};
  fullArtwork() {};
  iTunesRunning() {};

}

export default Player;
