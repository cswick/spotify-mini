interface BowtiePlist {
  // required
  BTArtistURL;
  BTMainFile;
  BTThemeArtist;
  BTThemeDevice;
  BTThemeIdentifier;
  BTThemeName;
  BTThemePreviewImage;
  BTThemeVersion;
  BTWindowHeight;
  BTWindowWidth;

  // optional
  BTArtworkBackgroundFill?;
  BTArtworkFunction;
  BTArtworkHeight?;
  BTArtworkWidth?;
  BTDisableArtworkSquaring?;
  BTDisableStatusBar?;
  BTMinimumVersion?;
  BTOrientationFunction?;
  BTPlayStateFunction?;
  BTReadyFunction?;
  BTStatusFunction?;
  BTTrackFunction?;
  BTWindowHasShadow?;
  BTWindowMode?;
}

interface Bowtie {
  addMouseTrackingForElement();
  buildVersion();
  chooseRemote();
  connectedRemote();
  currentFrame();
  frame();
  currentSourceName();
  escape();
  log();
  orientation();
  preferenceForKey();
  setFrame();
  setPreferenceForKey();
  version();
}

interface BowtiePlayer {
  //Playback Methods
  isConnected();
  nextTrack();
  pause();
  play();
  playerPosition();
  playPause();
  playState();
  previousTrack();
  setPlayerPosition();
  setVolume();
  stop();
  volume();

  //Track Information
  currentTrack();
  rating();
  ratingStars();
  renderedArtwork();
  setRating();
  uniqueString();

  //Shuffle and Repeat
  repeat();
  setRepeat();
  setShuffle();
  shuffle();

  //Presentation Methods
  canShow();
  name();
  show();

  //Deprecated Methods
  artwork();
  fullArtwork();
  iTunesRunning();
}

interface BowtieLastFM {
  ban();
  isConfigured();
  isEnabled();
  love();
}
