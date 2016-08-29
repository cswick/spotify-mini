export default class Bowtie implements Bowtie {
  constructor(options?) {

  }

  addMouseTrackingForElement() {};
  buildVersion() {};
  chooseRemote() {};
  connectedRemote() {};
  currentFrame() {
    // An array representing the frame of the window, in the order:
    // [x-offset, y-offset, width, height].
    return [0,0,0,0]
  };
  frame() {
    return this.currentFrame();
  };
  currentSourceName() {};
  escape() {};
  log() {};
  orientation() {};
  preferenceForKey() {};
  setFrame() {};
  setPreferenceForKey() {};
  version() {};

}
