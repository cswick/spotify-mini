// This helper remembers the size and position of your windows (and restores
// them in that place after app relaunch).
// Can be used for more than one window, just construct many
// instances of it and give each different name.

import { app, BrowserWindow, screen } from 'electron';
import jetpack from 'fs-jetpack';
import plist from 'simple-plist';
import * as path from 'path';

export default function () {

    let userDataDir = jetpack.cwd(app.getPath('userData'));
    let stateStoreFile = 'theme.json';
    let defaultTheme = {
        path: `${app.getAppPath()}${path.sep}themes`,
        name: 'default'
    };
    let selectedTheme = defaultTheme;
    let themePath = `${selectedTheme.path}${path.sep}${selectedTheme.name}`;
    let themeSettingsPath = `${themePath}${path.sep}Info.plist`;
    let themeSettings: BowtiePlist = plist.readFileSync(themeSettingsPath);

    return {
      path: themePath,
      settings: themeSettings
    };

}
