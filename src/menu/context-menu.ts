import { remote, ipcRenderer, BrowserWindow } from 'electron';
const { Menu } = remote;
import env from '../env';
import devMenu from './dev-menu-template';

let template: any = [
  { label: 'Settings', click: () => {} },
  { label: 'Copy track link', click: () => {} },
  {
    label: 'Zoom',
    submenu: [
      {label: 'Zoom In', role: 'zoomin', sublabel: 'Ctrl+Wheel Up' },
      {label: 'Zoom Out', role: 'zoomout', sublabel: 'Ctrl+Wheel Down' },
      {label: 'Reset Zoom', role: 'resetzoom' }
    ]
  }
];

if (env.name === 'development') {
  template.push(devMenu);
}

template.push({ role: 'quit' });

let menu = Menu.buildFromTemplate(template);

export default menu;
