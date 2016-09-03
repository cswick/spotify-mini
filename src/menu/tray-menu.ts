import { Menu } from 'electron';
import env from '../env';

let template: any = [
  { label: 'Settings', click: () => {} },
  { role: 'quit' }
];

let menu = Menu.buildFromTemplate(template);

export default menu;
