import Player from './player';
import Bowtie from './Bowtie';
import { ipcRenderer } from 'electron';

declare var process, global;

process.once('loaded', () => {
  let themeConfig = ipcRenderer.sendSync('get-theme-settings');
  let themeSettings: BowtiePlist = themeConfig && themeConfig.settings ? themeConfig.settings : {};
  let player = new Player(themeSettings);
  let bowtie = new Bowtie();
  global.iTunes = player;
  global.Player = player;
  global.Bowtie = bowtie;
});
