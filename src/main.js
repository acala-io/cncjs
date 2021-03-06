import 'babel-polyfill';
import chalk from 'chalk';
import ElectronConfig from 'electron-config';
import mkdirp from 'mkdirp';
import {app, Menu} from 'electron';

import pkg from './package.json';

import cnc from './cnc';
import menuTemplate from './electron-app/menu-template';
import WindowManager from './electron-app/WindowManager';

// The selection menu
const selectionMenu = Menu.buildFromTemplate([{role: 'copy'}, {type: 'separator'}, {role: 'selectall'}]);

// The input menu
const inputMenu = Menu.buildFromTemplate([
  {role: 'undo'},
  {role: 'redo'},
  {type: 'separator'},
  {role: 'cut'},
  {role: 'copy'},
  {role: 'paste'},
  {type: 'separator'},
  {role: 'selectall'},
]);

let windowManager = null;

const main = () => {
  // https://github.com/electron/electron/blob/master/docs/api/app.md#appmakesingleinstancecallback
  const shouldQuit = app.makeSingleInstance(() => {
    // Someone tried to run a second instance, we should focus our window.
    if (!windowManager) {
      return;
    }

    const window = windowManager.getWindow();
    if (window) {
      if (window.isMinimized()) {
        window.restore();
      }
      window.focus();
    }
  });

  if (shouldQuit) {
    app.quit();
    return;
  }

  const config = new ElectronConfig();

  // Create the user data directory if it does not exist
  const userData = app.getPath('userData');
  mkdirp.sync(userData);

  app.on('ready', async () => {
    try {
      const data = await cnc();

      const {address, port, routes} = {...data};
      if (!(address && port)) {
        console.error(`Unable to start the server at ${chalk.cyan(`http://${address}:${port}`)}`);
        return;
      }

      const menu = Menu.buildFromTemplate(menuTemplate({address, port, routes}));
      Menu.setApplicationMenu(menu);

      windowManager = new WindowManager();

      const url = `http://${address}:${port}`;
      // The bounds is a rectangle object with the following properties:
      // * `x` Number - The x coordinate of the origin of the rectangle.
      // * `y` Number - The y coordinate of the origin of the rectangle.
      // * `width` Number - The width of the rectangle.
      // * `height` Number - The height of the rectangle.
      const bounds = {
        height: 768, // Defaults to 768
        width: 1280, // Defaults to 1280
        ...config.get('bounds'),
      };
      const options = {
        ...bounds,
        title: `${pkg.name} ${pkg.version}`,
      };
      const window = windowManager.openWindow(url, options);

      // Save window size and position
      window.on('close', () => {
        config.set('bounds', window.getBounds());
      });

      // https://github.com/electron/electron/issues/4068#issuecomment-274159726
      window.webContents.on('context-menu', (event, props) => {
        const {isEditable, selectionText} = props;

        if (isEditable) {
          // Shows an input menu if editable
          inputMenu.popup(window);
        } else if (selectionText && String(selectionText).trim() !== '') {
          // Shows a selection menu if there was selected text
          selectionMenu.popup(window);
        }
      });
    } catch (err) {
      console.error('Error:', err);
    }
  });
};

main();
