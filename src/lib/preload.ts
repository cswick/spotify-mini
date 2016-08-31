import Player from './Player';
import Bowtie from './Bowtie';
import { remote, ipcRenderer, BrowserWindow } from 'electron';
import menu from '../helpers/context-menu';

declare var process, global, document;

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
  };
});
