import { remote } from 'electron';

export default class Bowtie implements Bowtie {
  constructor(options?) {

  }

  addMouseTrackingForElement() {};
  buildVersion() {};
  chooseRemote() {};
  connectedRemote() {};
  currentFrame() {
    let bounds = remote.getCurrentWindow().getBounds();
    let screen = remote.screen.getPrimaryDisplay();
    return [bounds.x, screen.size.height - bounds.y, bounds.width, bounds.height];
  };
  frame() {
    return this.currentFrame();
  };
  currentSourceName() {};
  escape() {};
  log() {};
  orientation() {};
  preferenceForKey() {};
  setFrame(x, y, width, height) {
    let screen = remote.screen.getPrimaryDisplay();
    remote.getCurrentWindow().setPosition(x, screen.size.height - y, true);
  };
  setPreferenceForKey() {};
  version() {};

}
