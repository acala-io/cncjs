import debounce from 'lodash/debounce';
import difference from 'lodash/difference';
import ensureArray from 'ensure-array';
import get from 'lodash/get';
import isElectron from 'is-electron';
import merge from 'lodash/merge';
import set from 'lodash/set';
import uniq from 'lodash/uniq';

import ImmutableStore from '../lib/immutable-store';
import log from '../lib/log';

import settings from '../config/settings';
import defaultState from './defaultState';

const store = new ImmutableStore(defaultState);

let userData = null;

// Check whether the code is running in Electron renderer process
if (isElectron()) {
  const electron = window.require('electron');
  const path = window.require('path'); // Require the path module within Electron
  const app = electron.remote.app;
  userData = {
    path: path.join(app.getPath('userData'), 'cnc.json'),
  };
}

const getConfig = () => {
  let content = '';

  // Check whether the code is running in Electron renderer process
  if (isElectron()) {
    const fs = window.require('fs'); // Require the fs module within Electron
    if (fs.existsSync(userData.path)) {
      content = fs.readFileSync(userData.path, 'utf8') || '{}';
    }
  } else {
    content = localStorage.getItem('cnc') || '{}';
  }

  return content;
};

const persist = data => {
  let localData = data;
  const {state, version} = {...localData};

  localData = {
    state: {
      ...store.state,
      ...state,
    },
    version: version || settings.version,
  };

  try {
    const value = JSON.stringify(localData, null, 2);

    // Check whether the code is running in Electron renderer process
    if (isElectron()) {
      const fs = window.require('fs'); // Use window.require to require fs module in Electron
      fs.writeFileSync(userData.path, value);
    } else {
      localStorage.setItem('cnc', value);
    }
  } catch (e) {
    log.error(e);
  }
};

const cnc = {
  state: {},
  version: settings.version,
};

const normalizeState = state => {
  // Keep default widgets unchanged
  const defaultList = get(defaultState, 'workspace.container.default.widgets');
  set(state, 'workspace.container.default.widgets', defaultList);

  // Update primary widgets
  let primaryList = get(cnc.state, 'workspace.container.primary.widgets');
  if (primaryList) {
    set(state, 'workspace.container.primary.widgets', primaryList);
  } else {
    primaryList = get(state, 'workspace.container.primary.widgets');
  }

  // Update secondary widgets
  let secondaryList = get(cnc.state, 'workspace.container.secondary.widgets');
  if (secondaryList) {
    set(state, 'workspace.container.secondary.widgets', secondaryList);
  } else {
    secondaryList = get(state, 'workspace.container.secondary.widgets');
  }

  primaryList = uniq(ensureArray(primaryList)); // Use the same order in primaryList
  primaryList = difference(primaryList, defaultList); // Exclude defaultList

  secondaryList = uniq(ensureArray(secondaryList)); // Use the same order in secondaryList
  secondaryList = difference(secondaryList, primaryList); // Exclude primaryList
  secondaryList = difference(secondaryList, defaultList); // Exclude defaultList

  set(state, 'workspace.container.primary.widgets', primaryList);
  set(state, 'workspace.container.secondary.widgets', secondaryList);

  return state;
};

try {
  const text = getConfig();
  const data = JSON.parse(text);
  cnc.version = get(data, 'version', settings.version);
  cnc.state = get(data, 'state', {});
} catch (e) {
  set(settings, 'error.corruptedWorkspaceSettings', true);
  log.error(e);
}

store.state = normalizeState(merge({}, defaultState, cnc.state || {}));

store.on(
  'change',
  debounce(state => {
    persist({state});
  }, 100)
);

store.getConfig = getConfig;
store.persist = persist;

export default store;
