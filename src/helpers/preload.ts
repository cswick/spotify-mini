import Player from '../lib/Player';
import Bowtie from '../lib/Bowtie';
import { remote, ipcRenderer, BrowserWindow } from 'electron';
import menu from '../menu/context-menu';
import handleScroll from '../helpers/zoom';
import ErrorSources from '../lib/ErrorSources';
import handleError from './error';

declare var process, global, document;

process.on('uncaughtException', (...args) => {
  handleError(ErrorSources.WINDOW, args);
});

process.once('loaded', () => {
  let themeConfig = ipcRenderer.sendSync('get-theme-settings');
  let themeSettings: BowtiePlist = themeConfig && themeConfig.settings ? themeConfig.settings : {};
  let player = new Player(themeSettings);
  let bowtie = new Bowtie();
  global.iTunes = player;
  global.Player = player;
  global.Bowtie = bowtie;
  global.onload = () => {
    global.document.body.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      menu.popup(remote.getCurrentWindow());
    });
    global.document.body.addEventListener('mousewheel', (e) => {
      e.preventDefault();
      handleScroll(e);
    });
  };
  ipcRenderer.on('error', (...args) => {
    handleError('Unknown', args);
  });
});
