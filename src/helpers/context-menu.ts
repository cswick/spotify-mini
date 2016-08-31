import { remote, ipcRenderer, BrowserWindow } from 'electron';
const { Menu, MenuItem } = remote;

const zoom = new Menu();

// Zoom works but the browserwindow size stays the same (overflow/)
zoom.append(new MenuItem({label: 'Zoom In', role: 'zoomin' }));
zoom.append(new MenuItem({label: 'Zoom Out', role: 'zoomout' }));
zoom.append(new MenuItem({label: 'Reset Zoom', role: 'resetzoom' }));

const menu = new Menu();
menu.append(new MenuItem({label: 'Zoom', submenu: zoom}));
menu.append(new MenuItem({label: 'Quit', role: 'quit' }));

export default menu;
