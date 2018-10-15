/* eslint-disable import/default */

import {isPlainObject, has, get, set, unset} from 'lodash';
import chalk from 'chalk';
import events from 'events';
import fs from 'fs';

import logger from '../../lib/logger';

const log = logger('service:configstore');

const defaultState = {
  checkForUpdates: true,
  controller: {
    exception: {
      ignoreErrors: false,
    },
  },
};

class ConfigStore extends events.EventEmitter {
  config = {};
  file = '';
  watcher = null;

  load(file) {
    this.file = file;
    this.reload();
    this.emit('load', this.config);

    if (this.watcher) {
      // Stop watching for changes
      this.watcher.close();
      this.watcher = null;
    }

    try {
      if (!fs.existsSync(this.file)) {
        const content = JSON.stringify({});
        fs.writeFileSync(this.file, content, 'utf8');
      }

      this.watcher = fs.watch(this.file, (eventType, filename) => {
        log.debug(`fs.watch(eventType='${eventType}', filename='${filename}')`);

        if (eventType === 'change') {
          log.debug(`"${filename}" has been changed`);
          const hasReloaded = this.reload(); // reload before making changes
          if (hasReloaded) {
            this.emit('change', this.config);
          }
        }
      });
    } catch (err) {
      log.error(err);
      this.emit('error', err); // emit error event
    }

    return this.config;
  }

  reload() {
    try {
      if (fs.existsSync(this.file)) {
        this.config = JSON.parse(fs.readFileSync(this.file, 'utf8'));
      }
    } catch (err) {
      err.fileName = this.file;
      log.error(`Unable to load data from ${chalk.yellow(JSON.stringify(this.file))}: err=${err}`);
      this.emit('error', err); // emit error event
      return false;
    }

    if (!isPlainObject(this.config)) {
      log.error(`"${this.file}" does not contain valid JSON`);
      this.config = {};
    }

    this.config.state = {
      ...defaultState,
      ...this.config.state,
    };

    return true;
  }

  sync() {
    try {
      const content = JSON.stringify(this.config, null, 4);
      fs.writeFileSync(this.file, content, 'utf8');
    } catch (err) {
      log.error(`Unable to write data to "${this.file}"`);
      this.emit('error', err); // emit error event
      return false;
    }

    return true;
  }

  has(key) {
    return has(this.config, key);
  }

  get(key, defaultValue) {
    if (!this.config) {
      this.reload();
    }

    return key !== undefined ? get(this.config, key, defaultValue) : this.config;
  }

  set(key, value, options) {
    const {silent = false} = {...options};

    if (key === undefined) {
      return;
    }

    const hasReloaded = this.reload(); // reload before making changes
    set(this.config, key, value);
    if (hasReloaded && !silent) {
      this.sync();
    }
  }

  unset(key) {
    if (key === undefined) {
      return;
    }

    const hasReloaded = this.reload(); // reload before making changes
    unset(this.config, key);
    if (hasReloaded) {
      this.sync();
    }
  }
}

const configstore = new ConfigStore();

export default configstore;
