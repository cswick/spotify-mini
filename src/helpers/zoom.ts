import { remote, webFrame } from 'electron';
import env from '../env';

declare var global: Window;

export var handleScroll = (e: MouseWheelEvent) => {
  if (e.ctrlKey) {
    let zoomModifier = Math.max(-0.1, Math.min(0.1, (e.wheelDelta || -e.detail)));
    let newZoom = webFrame.getZoomFactor() + zoomModifier;
    webFrame.setZoomFactor(newZoom);
    let nodes = global.document.querySelectorAll('body > *');
    if (nodes.length === 1) {
      let container = <HTMLElement>nodes.item(0);
      let originalOverflow = container.style.overflow;
      container.style.overflow = 'auto';
      let newWidth = Math.round(container.offsetWidth * newZoom);
      let newHeight = Math.round(container.offsetHeight * newZoom);
      if (env.name === 'development') {
        newHeight += 75;
        newWidth += 25;
      }
      container.style.overflow = originalOverflow;
      remote.getCurrentWindow().setSize(newWidth, newHeight, false);
    }
  }
}

export default handleScroll;
