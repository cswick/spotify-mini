// This is main process of Electron, started as first thing when your
// app starts. This script is running through entire life of your application.
// It doesn't have any windows which you can see on screen, but we can open
// window from here.

import { app, dialog, protocol, Menu, Tray } from 'electron';
import createWindow from './helpers/window';
import getThemeSettings from './helpers/theme';
import { ipcMain } from 'electron';
import * as path from 'path';
import trayMenu from './menu/tray-menu';

// Special module holding environment variables which you declared
// in config/env_xxx.json file.
import env from './env';

let mainWindow = null;
let tray = null;
let currentTheme = getThemeSettings();
ipcMain.on('get-theme-settings', (event, arg) => {
  event.returnValue = currentTheme;
});
const shouldQuit = app.makeSingleInstance((commandLine, workingDirectory) => {
  dialog.showMessageBox({type: 'info', message: `Welcome Back, You arrived from: ${commandLine}`});
  // Someone tried to run a second instance, we should focus our window.
  if (mainWindow) {
    mainWindow.focus();
  }
});

if (shouldQuit) {
  app.quit()
}

process.on('uncaughtException', (...args) => {
  ipcMain.emit('error', args);
});

// Save userData in separate folders for each environment.
// Thanks to this you can use production and development versions of the app
// on same machine like those are two separate apps.
if (env.name !== 'production') {
    var userDataPath = app.getPath('userData');
    app.setPath('userData', userDataPath + ' (' + env.name + ')');
}

if (process.platform === 'darwin') app.dock.hide();

app.setAsDefaultProtocolClient('bowtie');

app.on('ready', function () {

    Menu.setApplicationMenu(null);

    let iconFile = process.platform === 'win32' ? 'tray.ico' : 'trayTemplate.png';
    tray = new Tray(path.normalize(`${app.getAppPath()}/icons/${iconFile}`));

    var windowOptions = Object.assign({}, {
      width: currentTheme.settings.BTWindowWidth,
      height: currentTheme.settings.BTWindowHeight,
      webPreferences: { preload:  path.resolve(`${__dirname}/preload.js`) }
    }, env.windowProperties)

    mainWindow = createWindow('main', windowOptions);

    mainWindow.loadURL(`file://${currentTheme.path}/${currentTheme.settings.BTMainFile}`);

    tray.setContextMenu(trayMenu);
    console.log('wtf');

    console.log(dialog.showMessageBox(mainWindow, {type: 'info', message: `Welcome Back, You arrived!`}));

    if (1 == 1 || env.name === 'development') {
        mainWindow.openDevTools();
    }
});

app.on('open-url', function (event, url) {
  dialog.showMessageBox({type: 'info', message: `Welcome Back, You arrived from: ${url}`});
})

app.on('window-all-closed', function () {
    app.quit();
});
