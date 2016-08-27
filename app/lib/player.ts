import Spotify from './spotify'

// setTimeout(function() {
//   Spotify.pause().then(function(res) { console.log(res); }).catch(function(err) { console.error(err); });
// }, 50);
// setTimeout(function() {
//   Spotify.play().then(function(res) { console.log(res); }).catch(function(err) { console.error(err); });
// }, 5000);
// setTimeout(function() {
//   Spotify.seekTo(10).then(function(res) { console.log(res); }).catch(function(err) { console.error(err); });
// }, 1000);

class Player {
  constructor() {
    document.addEventListener('click', this.handleClick, false);
    Spotify.onAny((event, value) => {
      console.log(`${event}`);
      if (value) console.log(`${value.track.artist_resource.name} - ${value.track.track_resource.name}`);
    });
    Spotify.on('READY', () => {
      setInterval(() => {
        console.log(Spotify.getPosition());
      }, 250);
    });
  }

  handleClick(e) {
    switch (e.target.id) {
      case 'play':
        Spotify.play();
        e.target.id = 'pause';
        break;
      case 'next':
        break;
      case 'pause':
        Spotify.pause();
        e.target.id = 'play';
        break;
    }
    console.log(e.target);
  }
}

export var PlayerHelper = new Player();
export default PlayerHelper;
