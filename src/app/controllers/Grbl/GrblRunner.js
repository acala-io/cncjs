import events from 'events';
import {has, get, isEqual} from 'lodash';
import decimalPlaces from '../../lib/decimal-places';

import {GRBL_MACHINE_STATE_IDLE, GRBL_MACHINE_STATE_ALARM} from './constants';

import GrblLineParser from './GrblLineParser';
import GrblLineParserResultStatus from './GrblLineParserResultStatus';
import GrblLineParserResultOk from './GrblLineParserResultOk';
import GrblLineParserResultError from './GrblLineParserResultError';
import GrblLineParserResultAlarm from './GrblLineParserResultAlarm';
import GrblLineParserResultParserState from './GrblLineParserResultParserState';
import GrblLineParserResultParameters from './GrblLineParserResultParameters';
import GrblLineParserResultFeedback from './GrblLineParserResultFeedback';
import GrblLineParserResultSettings from './GrblLineParserResultSettings';
import GrblLineParserResultStartup from './GrblLineParserResultStartup';

class GrblRunner extends events.EventEmitter {
  state = {
    status: {
      machineState: '',
      mpos: {
        x: '0.000',
        y: '0.000',
        z: '0.000',
      },
      wpos: {
        x: '0.000',
        y: '0.000',
        z: '0.000',
      },
      ov: [],
    },
    parserstate: {
      modal: {
        motion: 'G0', // G0, G1, G2, G3, G38.2, G38.3, G38.4, G38.5, G80
        wcs: 'G54', // G54, G55, G56, G57, G58, G59
        plane: 'G17', // G17: xy-plane, G18: xz-plane, G19: yz-plane
        units: 'G21', // G20: Inches, G21: Millimeters
        distance: 'G90', // G90: Absolute, G91: Relative
        feedrate: 'G94', // G93: Inverse time mode, G94: Units per minute
        program: 'M0', // M0, M1, M2, M30
        spindle: 'M5', // M3: Spindle (cw), M4: Spindle (ccw), M5: Spindle off
        coolant: 'M9', // M7: Mist coolant, M8: Flood coolant, M9: Coolant off, [M7,M8]: Both on
      },
      tool: '',
      feedrate: '',
      spindle: '',
    },
  };
  settings = {
    version: '',
    parameters: {},
    settings: {},
  };

  parser = new GrblLineParser();

  parse(data) {
    let localData = data;
    localData = String(localData).replace(/\s+$/, '');
    if (!localData) {
      return;
    }

    this.emit('raw', {raw: localData});

    const result = this.parser.parse(localData) || {};
    const {type, payload} = result;

    if (type === GrblLineParserResultStatus) {
      // Grbl v1.1
      // WCO:0.000,10.000,2.500
      // A current work coordinate offset is now sent to easily convert
      // between position vectors, where WPos = MPos - WCO for each axis.
      if (has(payload, 'mpos') && !has(payload, 'wpos')) {
        payload.wpos = payload.wpos || {};
        payload.mpos.forEach((mpos, axis) => {
          const digits = decimalPlaces(mpos);
          const wco = get(payload.wco || this.state.status.wco, axis, 0);
          payload.wpos[axis] = (Number(mpos) - Number(wco)).toFixed(digits);
        });
      } else if (has(payload, 'wpos') && !has(payload, 'mpos')) {
        payload.mpos = payload.mpos || {};
        payload.wpos.forEach((wpos, axis) => {
          const digits = decimalPlaces(wpos);
          const wco = get(payload.wco || this.state.status.wco, axis, 0);
          payload.mpos[axis] = (Number(wpos) + Number(wco)).toFixed(digits);
        });
      }

      const nextState = {
        ...this.state,
        status: {
          ...this.state.status,
          ...payload,
        },
      };

      // Delete the raw key
      delete nextState.status.raw;

      if (!isEqual(this.state.status, nextState.status)) {
        this.state = nextState; // enforce change
      }
      this.emit('status', payload);
      return;
    }
    if (type === GrblLineParserResultOk) {
      this.emit('ok', payload);
      return;
    }
    if (type === GrblLineParserResultError) {
      // https://nodejs.org/api/events.html#events_error_events
      // As a best practice, listeners should always be added for the 'error' events.
      this.emit('error', payload);
      return;
    }
    if (type === GrblLineParserResultAlarm) {
      this.emit('alarm', payload);
      return;
    }
    if (type === GrblLineParserResultParserState) {
      const {modal, tool, feedrate, spindle} = payload;
      const nextState = {
        ...this.state,
        parserstate: {
          modal,
          tool,
          feedrate,
          spindle,
        },
      };
      if (!isEqual(this.state.parserstate, nextState.parserstate)) {
        this.state = nextState; // enforce change
      }
      this.emit('parserstate', payload);
      return;
    }
    if (type === GrblLineParserResultParameters) {
      const {name, value} = payload;
      const nextSettings = {
        ...this.settings,
        parameters: {
          ...this.settings.parameters,
          [name]: value,
        },
      };
      if (!isEqual(this.settings.parameters[name], nextSettings.parameters[name])) {
        this.settings = nextSettings; // enforce change
      }
      this.emit('parameters', payload);
      return;
    }
    if (type === GrblLineParserResultFeedback) {
      this.emit('feedback', payload);
      return;
    }
    if (type === GrblLineParserResultSettings) {
      const {name, value} = payload;
      const nextSettings = {
        ...this.settings,
        settings: {
          ...this.settings.settings,
          [name]: value,
        },
      };
      if (this.settings.settings[name] !== nextSettings.settings[name]) {
        this.settings = nextSettings; // enforce change
      }
      this.emit('settings', payload);
      return;
    }
    if (type === GrblLineParserResultStartup) {
      const {version} = payload;
      const nextSettings = {
        // enforce change
        ...this.settings,
        version,
      };
      if (!isEqual(this.settings.version, nextSettings.version)) {
        this.settings = nextSettings; // enforce change
      }
      this.emit('startup', payload);
      return;
    }
    if (localData.length > 0) {
      this.emit('others', payload);
      return;
    }
  }
  getMachinePosition(state = this.state) {
    return get(state, 'status.mpos', {});
  }
  getWorkPosition(state = this.state) {
    return get(state, 'status.wpos', {});
  }
  getModalGroup(state = this.state) {
    return get(state, 'parserstate.modal', {});
  }
  isAlarm() {
    const machineState = get(this.state, 'status.machineState');
    return machineState === GRBL_MACHINE_STATE_ALARM;
  }
  isIdle() {
    const machineState = get(this.state, 'status.machineState');
    return machineState === GRBL_MACHINE_STATE_IDLE;
  }
}

export default GrblRunner;
