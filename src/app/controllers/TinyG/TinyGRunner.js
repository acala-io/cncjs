import ensureArray from 'ensure-array';
import events from 'events';
import {each, get, isEqual, set} from 'lodash';

import TinyGLineParser from './TinyGLineParser';
import TinyGLineParserResultMotorTimeout from './TinyGLineParserResultMotorTimeout';
import TinyGLineParserResultOverrides from './TinyGLineParserResultOverrides';
import TinyGLineParserResultPowerManagement from './TinyGLineParserResultPowerManagement';
import TinyGLineParserResultQueueReports from './TinyGLineParserResultQueueReports';
import TinyGLineParserResultReceiveReports from './TinyGLineParserResultReceiveReports';
import TinyGLineParserResultStatusReports from './TinyGLineParserResultStatusReports';
import TinyGLineParserResultSystemSettings from './TinyGLineParserResultSystemSettings';

import {
  TINYG_MACHINE_STATE_READY,
  TINYG_MACHINE_STATE_ALARM,
  TINYG_MACHINE_STATE_STOP,
  TINYG_MACHINE_STATE_END,

  // G-code Motion Mode
  TINYG_GCODE_MOTION_G0,
  TINYG_GCODE_MOTION_G1,
  TINYG_GCODE_MOTION_G2,
  TINYG_GCODE_MOTION_G3,
  TINYG_GCODE_MOTION_G80,

  // G-code Coordinate System
  TINYG_GCODE_COORDINATE_G53,
  TINYG_GCODE_COORDINATE_G54,
  TINYG_GCODE_COORDINATE_G55,
  TINYG_GCODE_COORDINATE_G56,
  TINYG_GCODE_COORDINATE_G57,
  TINYG_GCODE_COORDINATE_G58,
  TINYG_GCODE_COORDINATE_G59,

  // G-code Plane Selection
  TINYG_GCODE_PLANE_G17,
  TINYG_GCODE_PLANE_G18,
  TINYG_GCODE_PLANE_G19,

  // G-code Units
  TINYG_GCODE_UNITS_G20,
  TINYG_GCODE_UNITS_G21,

  // G-code Distance Mode
  TINYG_GCODE_DISTANCE_G90,
  TINYG_GCODE_DISTANCE_G91,

  // G-code Feedrate Mode
  TINYG_GCODE_FEEDRATE_G93,
  TINYG_GCODE_FEEDRATE_G94,
  TINYG_GCODE_FEEDRATE_G95,

  // G-code Path Control Mode
  TINYG_GCODE_PATH_G61,
  TINYG_GCODE_PATH_G61_1,
  TINYG_GCODE_PATH_G64,
} from './constants';

class TinyGRunner extends events.EventEmitter {
  state = {
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
    modal: {
      motion: '', // G0, G1, G2, G3, G38.2, G38.3, G38.4, G38.5, G80
      wcs: '', // G54, G55, G56, G57, G58, G59
      plane: '', // G17: xy-plane, G18: xz-plane, G19: yz-plane
      units: '', // G20: Inches, G21: Millimeters
      distance: '', // G90: Absolute, G91: Relative
      feedrate: '', // G93: Inverse time mode, G94: Units per minute
      path: '', // G61: Exact path mode, G61.1: Exact stop mode, G64: Continuous mode
      spindle: '', // M3: Spindle (cw), M4: Spindle (ccw), M5: Spindle off
      coolant: '', // M7: Mist coolant, M8: Flood coolant, M9: Coolant off, [M7,M8]: Both on
    },
    spe: 0, // [edge-082.10] Spindle enable
    spd: 0, // [edge-082.10] Spindle direction
    spc: 0, // [edge-101.03] Spindle control
    sps: 0, // [edge-082.10] Spindle speed
    mt: 0, // Motor timeout
    pwr: {}, // Power management: { "1": 0, "2": 0, "3": 0, "4": 0 }
    qr: 0, // Queue reports
  };
  settings = {
    // Identification Parameters
    // https://github.com/synthetos/g2/wiki/Configuring-0.99-System-Groups#identification-parameters
    fb: 0, // firmware build
    fbs: '', // firmware build string
    fbc: '', // firmware build config
    fv: 0, // firmware version
    hp: 0, // hardware platform: 1=Xmega, 2=Due, 3=v9(ARM)
    hv: 0, // hardware version
    id: '', // board ID

    mfo: 1, // manual feedrate override
    mto: 1, // manual traverse override
    sso: 1, // spindle speed override
  };
  footer = {
    revision: 0,
    statusCode: 0, // https://github.com/synthetos/g2/wiki/Status-Codes
    rxBufferInfo: 0,
  };
  plannerBufferPoolSize = 0; // Suggest 12 min. Limit is 255

  parser = new TinyGLineParser();

  parse(data) {
    let localData = data;
    localData = String(localData).replace(/\s+$/, '');
    if (!localData) {
      return;
    }

    this.emit('raw', {raw: localData});

    if (localData.match(/^{/)) {
      try {
        localData = JSON.parse(localData);
      } catch (err) {
        localData = {};
      }

      const result = this.parser.parse(localData) || {};
      const {type, payload} = result;

      if (type === TinyGLineParserResultMotorTimeout) {
        const {mt = this.state.mt} = payload;

        if (this.state.mt !== mt) {
          this.state = {
            // enforce change
            ...this.state,
            mt,
          };
        }

        this.emit('mt', payload.mt);
      } else if (type === TinyGLineParserResultPowerManagement) {
        const {pwr = this.state.pwr} = payload;

        if (!isEqual(this.state.pwr, pwr)) {
          this.state = {
            // enforce change
            ...this.state,
            pwr,
          };
        }

        this.emit('pwr', payload.pwr);
      } else if (type === TinyGLineParserResultQueueReports) {
        const {qr, qi, qo} = payload;

        // The planner buffer pool size will be checked every time the planner buffer changes
        if (qr > this.plannerBufferPoolSize) {
          this.plannerBufferPoolSize = qr;
        }

        if (this.state.qr !== qr) {
          this.state = {
            // enforce change
            ...this.state,
            qr,
          };
        }
        this.emit('qr', {qr, qi, qo});
      } else if (type === TinyGLineParserResultStatusReports) {
        // https://github.com/synthetos/TinyG/wiki/TinyG-Status-Codes#status-report-enumerations
        const keymaps = {
          cycs: 'cycleState',
          feed: 'feedrate',
          hold: 'feedholdState',
          line: 'line',
          mots: 'motionState',
          stat: 'machineState',
          vel: 'velocity',
          momo: (target, val) => {
            const gcode =
              {
                [TINYG_GCODE_MOTION_G0]: 'G0', // Straight (linear) traverse
                [TINYG_GCODE_MOTION_G1]: 'G1', // Straight (linear) feed
                [TINYG_GCODE_MOTION_G2]: 'G2', // CW arc traverse
                [TINYG_GCODE_MOTION_G3]: 'G3', // CCW arc traverse
                [TINYG_GCODE_MOTION_G80]: 'G80', // Cancel motion mode
              }[val] || '';
            set(target, 'modal.motion', gcode);
          },
          coor: (target, val) => {
            const gcode =
              {
                [TINYG_GCODE_COORDINATE_G53]: 'G53', // Machine coordinate system
                [TINYG_GCODE_COORDINATE_G54]: 'G54', // Coordinate system 1
                [TINYG_GCODE_COORDINATE_G55]: 'G55', // Coordinate system 2
                [TINYG_GCODE_COORDINATE_G56]: 'G56', // Coordinate system 3
                [TINYG_GCODE_COORDINATE_G57]: 'G57', // Coordinate system 4
                [TINYG_GCODE_COORDINATE_G58]: 'G58', // Coordinate system 5
                [TINYG_GCODE_COORDINATE_G59]: 'G59', // Coordinate system 6
              }[val] || '';
            set(target, 'modal.wcs', gcode);
          },
          plan: (target, val) => {
            const gcode =
              {
                [TINYG_GCODE_PLANE_G17]: 'G17', // XY plane
                [TINYG_GCODE_PLANE_G18]: 'G18', // XZ plane
                [TINYG_GCODE_PLANE_G19]: 'G19', // YZ plane
              }[val] || '';
            set(target, 'modal.plane', gcode);
          },
          unit: (target, val) => {
            const gcode =
              {
                [TINYG_GCODE_UNITS_G20]: 'G20', // Inches mode
                [TINYG_GCODE_UNITS_G21]: 'G21', // Millimeters mode
              }[val] || '';
            set(target, 'modal.units', gcode);
          },
          dist: (target, val) => {
            const gcode =
              {
                [TINYG_GCODE_DISTANCE_G90]: 'G90', // Absolute distance
                [TINYG_GCODE_DISTANCE_G91]: 'G91', // Incremental distance
              }[val] || '';
            set(target, 'modal.distance', gcode);
          },
          frmo: (target, val) => {
            const gcode =
              {
                [TINYG_GCODE_FEEDRATE_G93]: 'G93', // Inverse time mode
                [TINYG_GCODE_FEEDRATE_G94]: 'G94', // Units-per-minute mode
                [TINYG_GCODE_FEEDRATE_G95]: 'G95', // Units-per-revolution mode
              }[val] || '';
            set(target, 'modal.feedrate', gcode);
          },
          path: (target, val) => {
            const gcode =
              {
                [TINYG_GCODE_PATH_G61]: 'G61', // Exact path mode
                [TINYG_GCODE_PATH_G61_1]: 'G61.1', // Exact stop mode
                [TINYG_GCODE_PATH_G64]: 'G64', // Continuous mode
              }[val] || '';
            set(target, 'modal.path', gcode);
          },
          // [edge-082.10] Spindle enable (removed in edge-101.03)
          spe: (target, val) => {
            set(target, 'spe', val);

            const spe = get(target, 'spe', 0);
            const spd = get(target, 'spd', 0);
            if (!spe) {
              set(target, 'modal.spindle', 'M5');
            } else {
              set(target, 'modal.spindle', spd === 0 ? 'M3' : 'M4');
            }
          },
          // [edge-082.10] Spindle direction (removed in edge-101.03)
          spd: (target, val) => {
            set(target, 'spd', val);

            const spe = get(target, 'spe', 0);
            const spd = get(target, 'spd', 0);
            if (!spe) {
              set(target, 'modal.spindle', 'M5');
            } else {
              set(target, 'modal.spindle', spd === 0 ? 'M3' : 'M4');
            }
          },
          // [edge-101.03] Spindle control
          // 0 = OFF, 1 = CW, 2 = CCW
          spc: (target, val) => {
            if (val === 0) {
              // OFF
              set(target, 'modal.spindle', 'M5');
            } else if (val === 1) {
              // CW
              set(target, 'modal.spindle', 'M3');
            } else if (val === 2) {
              // CCW
              set(target, 'modal.spindle', 'M4');
            }
          },
          // [edge-082.10] Spindle speed
          sps: (target, val) => {
            set(target, 'sps', val);
          },
          // [edge-082.10] Mist coolant
          com: (target, val) => {
            if (val === 0) {
              // Coolant Off
              set(target, 'modal.coolant', 'M9');
              return;
            }

            const data = ensureArray(get(target, 'modal.coolant', ''));
            if (data.indexOf('M8') >= 0) {
              // Mist + Flood
              set(target, 'modal.coolant', ['M7', 'M8']);
              return;
            }

            // Mist
            set(target, 'modal.coolant', 'M7');
          },
          // [edge-082.10] Flood coolant
          cof: (target, val) => {
            if (val === 0) {
              // Coolant Off
              set(target, 'modal.coolant', 'M9');
              return;
            }

            const data = ensureArray(get(target, 'modal.coolant', ''));
            if (data.indexOf('M7') >= 0) {
              // Mist + Flood
              set(target, 'modal.coolant', ['M7', 'M8']);
              return;
            }

            // Flood
            set(target, 'modal.coolant', 'M8');
          },

          // Work Position
          // {posx: ... through {posa:... are reported in the currently
          // active Units mode (G20/G21), and also apply any offsets,
          // including coordinate system selection, G92, and tool offsets.
          // These are provided to drive digital readouts
          posx: 'wpos.x',
          posy: 'wpos.y',
          posz: 'wpos.z',
          posa: 'wpos.a',
          posb: 'wpos.b',
          posc: 'wpos.c',

          // Machine Position
          // {mpox: ... through {mpoa:... are reported in the machine's
          // internal coordinate system (canonical machine) and will always
          // be in millimeters with no offsets.
          // These are provided to drive graphical displays so they do not
          // have to be aware of Gcode Units mode or any offsets in effect.
          mpox: 'mpos.x',
          mpoy: 'mpos.y',
          mpoz: 'mpos.z',
          mpoa: 'mpos.a',
          mpob: 'mpos.b',
          mpoc: 'mpos.c',
        };

        const state = {
          ...this.state,
          modal: {
            ...this.state.modal,
          },
          mpos: {
            ...this.state.mpos,
          },
          wpos: {
            ...this.state.wpos,
          },
        };

        each(keymaps, (target, key) => {
          if (typeof target === 'string') {
            const val = get(payload.sr, key);
            if (val !== undefined) {
              set(state, target, val);
            }
          }
          if (typeof target === 'function') {
            const val = get(payload.sr, key);
            if (val !== undefined) {
              target(state, val);
            }
          }
        });

        if (!isEqual(this.state, state)) {
          this.state = {
            // enforce change
            ...this.state,
            ...state,
          };
        }
        this.emit('sr', payload.sr);
      } else if (type === TinyGLineParserResultSystemSettings) {
        this.settings = {
          // enforce change
          ...this.settings,
          ...payload.sys,
        };
        this.emit('sys', payload.sys);
      } else if (type === TinyGLineParserResultOverrides) {
        const {mfo = this.settings.mfo, mto = this.settings.mto, sso = this.settings.sso} = payload;

        this.settings = {
          // enforce change
          ...this.settings,
          mfo,
          mto,
          sso,
        };
        this.emit('ov', {mfo, mto, sso});
      } else if (type === TinyGLineParserResultReceiveReports) {
        const settings = {};
        for (const key in payload.r) {
          if (key in this.settings) {
            settings[key] = payload.r[key];
          }
        }
        if (Object.keys(settings).length > 0) {
          this.settings = {
            // enforce change
            ...this.settings,
            ...settings,
          };
        }

        this.emit('r', payload.r);
      }

      if (payload.f && payload.f.length > 0) {
        this.footer.revision = payload.f[0];
        this.footer.statusCode = payload.f[1];
        this.footer.rxBufferInfo = payload.f[2];
        this.emit('f', payload.f);
      }
    }
  }

  getMachinePosition(state = this.state) {
    return get(state, 'mpos', {});
  }

  getWorkPosition(state = this.state) {
    return get(state, 'wpos', {});
  }

  getModalState(state = this.state) {
    return get(state, 'modal', {});
  }

  isAlarm() {
    const machineState = get(this.state, 'machineState');
    return machineState === TINYG_MACHINE_STATE_ALARM;
  }

  isIdle() {
    const machineState = get(this.state, 'machineState');
    return (
      machineState === TINYG_MACHINE_STATE_READY ||
      machineState === TINYG_MACHINE_STATE_STOP ||
      machineState === TINYG_MACHINE_STATE_END
    );
  }
}

export default TinyGRunner;
