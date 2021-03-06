/* eslint-disable import/default */

import * as parser from 'gcode-parser';
import {find, get, isEqual, intersection, isEmpty, noop, throttle, uniq} from 'lodash';
import config from '../../services/configstore';
import controllers from '../../store/controllers';
import delay from '../../lib/delay';
import ensureArray from 'ensure-array';
import ensurePositiveNumber from '../../lib/ensure-positive-number';
import evaluateExpression from '../../lib/evaluate-expression';
import EventTrigger from '../../lib/EventTrigger';
import Feeder from '../../lib/Feeder';
import interpret from './interpret';
import logger from '../../lib/logger';
import MarlinRunner from './MarlinRunner';
import monitor from '../../services/monitor';
import Sender, {SP_TYPE_SEND_RESPONSE} from '../../lib/Sender';
import SerialConnection from '../../lib/SerialConnection';
import SocketConnection from '../../lib/SocketConnection';
import taskRunner from '../../services/taskrunner';
import translateExpression from '../../lib/translate-expression';
import Workflow, {WORKFLOW_STATE_IDLE, WORKFLOW_STATE_PAUSED, WORKFLOW_STATE_RUNNING} from '../../lib/Workflow';
import {MARLIN, QUERY_TYPE_POSITION, QUERY_TYPE_TEMPERATURE} from './constants';
import {WRITE_SOURCE_CLIENT, WRITE_SOURCE_SERVER, WRITE_SOURCE_FEEDER, WRITE_SOURCE_SENDER} from '../constants';

// % commands
const WAIT = '%wait';

const log = logger('controller:Marlin');

class MarlinController {
  type = MARLIN;

  // CNCEngine
  engine = null;

  // Sockets
  sockets = {};

  // Connection
  connection = null;
  connectionEventListener = {
    data: data => {
      log.silly(`< ${data}`);
      this.runner.parse(String(data));
    },
    close: err => {
      this.ready = false;
      if (err) {
        log.error(
          `The connection was closed unexpectedly: type=${this.connection.type}, settings=${JSON.stringify(
            this.connection.settings
          )}`
        );
        log.error(err);
      }

      this.close(() => {
        // Remove controller
        const ident = this.connection.ident;
        delete controllers[ident];
        controllers[ident] = undefined;

        // Destroy controller
        this.destroy();
      });
    },
    error: err => {
      this.ready = false;
      if (err) {
        log.error(
          `An unexpected error occurred: type=${this.connection.type}, settings=${JSON.stringify(
            this.connection.settings
          )}`
        );
        log.error(err);
      }
    },
  };

  // Marlin
  controller = null;
  ready = false;
  state = {};
  settings = {};
  feedOverride = 100;
  spindleOverride = 100;

  history = {
    // The write source is one of the following:
    // * WRITE_SOURCE_CLIENT
    // * WRITE_SOURCE_SERVER
    // * WRITE_SOURCE_FEEDER
    // * WRITE_SOURCE_SENDER
    writeSource: null,

    writeLine: '',
  };

  // Event Trigger
  event = null;

  // Feeder
  feeder = null;

  // Sender
  sender = null;
  senderFinishTime = 0;

  // Workflow
  workflow = null;

  // Query
  queryTimer = null;
  query = {
    // state
    type: null,
    lastQueryTime: 0,

    // action
    issue: () => {
      if (!this.query.type) {
        return;
      }

      const now = new Date().getTime();

      if (this.query.type === QUERY_TYPE_POSITION) {
        this.connection.write('M114\n', {
          source: WRITE_SOURCE_SERVER,
        });
        this.lastQueryTime = now;
      } else if (this.query.type === QUERY_TYPE_TEMPERATURE) {
        this.connection.write('M105\n', {
          source: WRITE_SOURCE_SERVER,
        });
        this.lastQueryTime = now;
      } else {
        log.error('Unsupported query type:', this.query.type);
      }

      this.query.type = null;
    },
  };

  // Get the current position of the active nozzle and stepper values.
  queryPosition = (() => {
    let lastQueryTime = 0;

    return throttle(() => {
      // Check the ready flag
      if (!this.ready) {
        return;
      }

      const now = new Date().getTime();

      if (!this.query.type) {
        this.query.type = QUERY_TYPE_POSITION;
        lastQueryTime = now;
      } else if (lastQueryTime > 0) {
        const timespan = Math.abs(now - lastQueryTime);
        const toleranceTime = 5000; // 5 seconds

        if (timespan >= toleranceTime) {
          log.silly(`Reschedule current position query: now=${now}ms, timespan=${timespan}ms`);
          this.query.type = QUERY_TYPE_POSITION;
          lastQueryTime = now;
        }
      }
    }, 500);
  })();

  // Request a temperature report to be sent to the host at some point in the future.
  queryTemperature = (() => {
    let lastQueryTime = 0;

    return throttle(() => {
      // Check the ready flag
      if (!this.ready) {
        return;
      }

      const now = new Date().getTime();

      if (!this.query.type) {
        this.query.type = QUERY_TYPE_TEMPERATURE;
        lastQueryTime = now;
      } else if (lastQueryTime > 0) {
        const timespan = Math.abs(now - lastQueryTime);
        const toleranceTime = 10000; // 10 seconds

        if (timespan >= toleranceTime) {
          log.silly(`Reschedule temperture report query: now=${now}ms, timespan=${timespan}ms`);
          this.query.type = QUERY_TYPE_TEMPERATURE;
          lastQueryTime = now;
        }
      }
    }, 1000);
  })();

  get connectionOptions() {
    return {
      ident: this.connection.ident,
      type: this.connection.type,
      settings: this.connection.settings,
    };
  }
  get isOpen() {
    return this.connection && this.connection.isOpen;
  }
  get isClose() {
    return !this.isOpen;
  }
  get status() {
    return {
      type: this.type,
      connection: {
        type: get(this.connection, 'type', ''),
        settings: get(this.connection, 'settings', {}),
      },
      sockets: Object.keys(this.sockets).length,
      ready: this.ready,
      settings: this.settings,
      state: this.state,
      feeder: this.feeder.toJSON(),
      sender: this.sender.toJSON(),
      workflow: {
        state: this.workflow.state,
      },
    };
  }

  constructor(engine, connectionType = 'serial', options) {
    let localOptions = options;
    if (!engine) {
      throw new TypeError(`"engine" must be specified: ${engine}`);
    }

    if (!['serial', 'socket'].includes(connectionType)) {
      throw new TypeError(`"connectionType" is invalid: ${connectionType}`);
    }

    // Engine
    this.engine = engine;

    localOptions = {
      ...localOptions,
      writeFilter: (data, context) => {
        const {source = null} = {...context};
        const line = data.trim();

        // Update write history
        this.history.writeSource = source;
        this.history.writeLine = line;

        if (!line) {
          return data;
        }

        const nextState = {
          ...this.runner.state,
          modal: {
            ...this.runner.state.modal,
          },
        };

        interpret(line, (cmd, params) => {
          // motion
          if (['G0', 'G1', 'G2', 'G3', 'G38.2', 'G38.3', 'G38.4', 'G38.5', 'G80'].includes(cmd)) {
            nextState.modal.motion = cmd;

            if (params.F !== undefined) {
              if (cmd === 'G0') {
                nextState.rapidFeedrate = params.F;
              } else {
                nextState.feedrate = params.F;
              }
            }
          }

          // wcs
          if (['G54', 'G55', 'G56', 'G57', 'G58', 'G59'].includes(cmd)) {
            nextState.modal.wcs = cmd;
          }

          // plane
          if (['G17', 'G18', 'G19'].includes(cmd)) {
            // G17: xy-plane, G18: xz-plane, G19: yz-plane
            nextState.modal.plane = cmd;
          }

          // units
          if (['G20', 'G21'].includes(cmd)) {
            // G20: Inches, G21: Millimeters
            nextState.modal.units = cmd;
          }

          // distance
          if (['G90', 'G91'].includes(cmd)) {
            // G90: Absolute, G91: Relative
            nextState.modal.distance = cmd;
          }

          // feedrate
          if (['G93', 'G94'].includes(cmd)) {
            // G93: Inverse time mode, G94: Units per minute
            nextState.modal.feedrate = cmd;
          }

          // program
          if (['M0', 'M1', 'M2', 'M30'].includes(cmd)) {
            nextState.modal.program = cmd;
          }

          // spindle or head
          if (['M3', 'M4', 'M5'].includes(cmd)) {
            // M3: Spindle (cw), M4: Spindle (ccw), M5: Spindle off
            nextState.modal.spindle = cmd;

            if (cmd === 'M3' || cmd === 'M4') {
              if (params.S !== undefined) {
                nextState.spindle = params.S;
              }
            }
          }

          // coolant
          if (['M7', 'M8', 'M9'].includes(cmd)) {
            const coolant = nextState.modal.coolant;

            // M7: Mist coolant, M8: Flood coolant, M9: Coolant off, [M7,M8]: Both on
            if (cmd === 'M9' || coolant === 'M9') {
              nextState.modal.coolant = cmd;
            } else {
              nextState.modal.coolant = uniq(ensureArray(coolant).concat(cmd)).sort();
              if (nextState.modal.coolant.length === 1) {
                nextState.modal.coolant = nextState.modal.coolant[0];
              }
            }
          }
        });

        if (!isEqual(this.runner.state, nextState)) {
          this.runner.state = nextState; // enforce change
        }

        return data;
      },
    };

    // Connection
    if (connectionType === 'serial') {
      this.connection = new SerialConnection(localOptions);
    } else if (connectionType === 'socket') {
      this.connection = new SocketConnection(localOptions);
    }

    // Event Trigger
    this.event = new EventTrigger((event, trigger, commands) => {
      log.debug(`EventTrigger: event="${event}", trigger="${trigger}", commands="${commands}"`);
      if (trigger === 'system') {
        taskRunner.run(commands);
      } else {
        this.command('gcode', commands);
      }
    });

    // Feeder
    this.feeder = new Feeder({
      dataFilter: (line, context) => {
        let localLine = line;
        let localContext = context;
        // Remove comments that start with a semicolon `;`
        localLine = localLine.replace(/\s*;.*/g, '').trim();
        localContext = this.populateContext(localContext);

        if (localLine[0] === '%') {
          // %wait
          if (localLine === WAIT) {
            log.debug('Wait for the planner to empty');
            // G4 [P<time in ms>] [S<time in sec>]
            // If both S and P are included, S takes precedence.
            return 'G4 P500'; // dwell
          }

          // Expression
          // %_x=posx,_y=posy,_z=posz
          evaluateExpression(localLine.slice(1), localContext);
          return '';
        }

        // line="G0 X[posx - 8] Y[ymax]"
        // > "G0 X2 Y50"
        localLine = translateExpression(localLine, localContext);
        const data = parser.parseLine(localLine, {flatten: true});
        const words = ensureArray(data.words);

        // M109 Set extruder temperature and wait for the target temperature to be reached
        if (words.includes('M109')) {
          log.debug(`Wait for extruder temperature to reach target temperature (${localLine})`);
          this.feeder.hold({data: 'M109'}); // Hold reason
        }

        // M190 Set heated bed temperature and wait for the target temperature to be reached
        if (words.includes('M190')) {
          log.debug(`Wait for heated bed temperature to reach target temperature (${localLine})`);
          this.feeder.hold({data: 'M190'}); // Hold reason
        }

        {
          // Program Mode: M0, M1
          const programMode = intersection(words, ['M0', 'M1'])[0];
          if (programMode === 'M0') {
            log.debug('M0 Program Pause');
            this.feeder.hold({data: 'M0'}); // Hold reason
          } else if (programMode === 'M1') {
            log.debug('M1 Program Pause');
            this.feeder.hold({data: 'M1'}); // Hold reason
          }
        }

        // M6 Tool Change
        if (words.includes('M6')) {
          log.debug('M6 Tool Change');
          this.feeder.hold({data: 'M6'}); // Hold reason
        }

        return localLine;
      },
    });
    this.feeder.on('data', (line = '', context = {}) => {
      let localLine = line;
      if (this.isClose) {
        log.error(`Serial port "${this.options.port}" is not accessible`);
        return;
      }

      if (this.runner.isAlarm()) {
        this.feeder.reset();
        log.warn('Stopped sending G-code commands in Alarm mode');
        return;
      }

      localLine = String(localLine).trim();
      if (localLine.length === 0) {
        return;
      }

      this.emit('connection:write', this.connectionOptions, `${localLine}\n`, {
        ...context,
        source: WRITE_SOURCE_FEEDER,
      });

      this.connection.write(`${localLine}\n`, {
        source: WRITE_SOURCE_FEEDER,
      });
      log.silly(`> ${localLine}`);
    });
    this.feeder.on('hold', noop);
    this.feeder.on('unhold', noop);

    // Sender
    this.sender = new Sender(SP_TYPE_SEND_RESPONSE, {
      dataFilter: (line, context) => {
        let localLine = line;
        let localContext = context;
        // Remove comments that start with a semicolon `;`
        localLine = localLine.replace(/\s*;.*/g, '').trim();
        localContext = this.populateContext(localContext);

        const {sent, received} = this.sender.state;

        if (localLine[0] === '%') {
          // %wait
          if (localLine === WAIT) {
            log.debug(`Wait for the planner to empty: line=${sent + 1}, sent=${sent}, received=${received}`);
            this.sender.hold({data: WAIT}); // Hold reason

            // G4 [P<time in ms>] [S<time in sec>]
            // If both S and P are included, S takes precedence.
            return 'G4 P500'; // dwell
          }

          // Expression
          // %_x=posx,_y=posy,_z=posz
          evaluateExpression(localLine.slice(1), localContext);
          return '';
        }

        // line="G0 X[posx - 8] Y[ymax]"
        // > "G0 X2 Y50"
        localLine = translateExpression(localLine, localContext);
        const data = parser.parseLine(localLine, {flatten: true});
        const words = ensureArray(data.words);

        // M109 Set extruder temperature and wait for the target temperature to be reached
        if (words.includes('M109')) {
          log.debug(
            `Wait for extruder temperature to reach target temperature (${localLine}): line=${sent +
              1}, sent=${sent}, received=${received}`
          );
          const reason = {data: 'M109'};
          this.sender.hold(reason); // Hold reason
        }

        // M190 Set heated bed temperature and wait for the target temperature to be reached
        if (words.includes('M190')) {
          log.debug(
            `Wait for heated bed temperature to reach target temperature (${localLine}): line=${sent +
              1}, sent=${sent}, received=${received}`
          );
          const reason = {data: 'M190'};
          this.sender.hold(reason); // Hold reason
        }

        {
          // Program Mode: M0, M1
          const programMode = intersection(words, ['M0', 'M1'])[0];
          if (programMode === 'M0') {
            log.debug(`M0 Program Pause: line=${sent + 1}, sent=${sent}, received=${received}`);
            this.workflow.pause({data: 'M0'});
          } else if (programMode === 'M1') {
            log.debug(`M1 Program Pause: line=${sent + 1}, sent=${sent}, received=${received}`);
            this.workflow.pause({data: 'M1'});
          }
        }

        // M6 Tool Change
        if (words.includes('M6')) {
          log.debug(`M6 Tool Change: line=${sent + 1}, sent=${sent}, received=${received}`);
          this.workflow.pause({data: 'M6'});
        }

        return localLine;
      },
    });
    this.sender.on('data', (line = '') => {
      let localLine = line;
      if (this.isClose) {
        log.error(`Serial port "${this.options.port}" is not accessible`);
        return;
      }

      if (this.workflow.state === WORKFLOW_STATE_IDLE) {
        log.error(`Unexpected workflow state: ${this.workflow.state}`);
        return;
      }

      localLine = String(localLine).trim();
      if (localLine.length === 0) {
        log.warn(`Expected non-empty line: N=${this.sender.state.sent}`);
        return;
      }

      this.connection.write(`${localLine}\n`, {
        source: WRITE_SOURCE_SENDER,
      });
      log.silly(`> ${localLine}`);
    });
    this.sender.on('hold', noop);
    this.sender.on('unhold', noop);
    this.sender.on('start', () => {
      this.senderFinishTime = 0;
    });
    this.sender.on('end', finishTime => {
      this.senderFinishTime = finishTime;
    });

    // Workflow
    this.workflow = new Workflow();
    this.workflow.on('start', () => {
      this.emit('workflow:state', this.workflow.state);
      this.sender.rewind();
    });
    this.workflow.on('stop', () => {
      this.emit('workflow:state', this.workflow.state);
      this.sender.rewind();
    });
    this.workflow.on('pause', (...args) => {
      this.emit('workflow:state', this.workflow.state);

      if (args.length > 0) {
        const reason = {...args[0]};
        this.sender.hold(reason); // Hold reason
      } else {
        this.sender.hold();
      }
    });
    this.workflow.on('resume', () => {
      this.emit('workflow:state', this.workflow.state);

      // Reset feeder prior to resume program execution
      this.feeder.reset();

      // Resume program execution
      this.sender.unhold();
      this.sender.next();
    });

    // Marlin
    this.runner = new MarlinRunner();

    this.runner.on('raw', noop);

    this.runner.on('start', res => {
      this.emit('connection:read', this.connectionOptions, res.raw);

      // Set ready flag to true when receiving a start message
      // Note: It might have chance of receiving garbage characters on startup due to electronic noise.
      this.ready = true;
    });

    this.runner.on('echo', res => {
      this.emit('connection:read', this.connectionOptions, res.raw);
    });

    this.runner.on('firmware', res => {
      this.emit('connection:read', this.connectionOptions, res.raw);
    });

    this.runner.on('pos', res => {
      log.silly(
        `controller.on('pos'): source=${this.history.writeSource}, line=${JSON.stringify(
          this.history.writeLine
        )}, res=${JSON.stringify(res)}`
      );

      if ([WRITE_SOURCE_CLIENT, WRITE_SOURCE_FEEDER].includes(this.history.writeSsource)) {
        this.emit('connection:read', this.connectionOptions, res.raw);
      }
    });

    this.runner.on('temperature', res => {
      log.silly(
        `controller.on('temperature'): source=${this.history.writeSource}, line=${JSON.stringify(
          this.history.writeLine
        )}, res=${JSON.stringify(res)}`
      );

      if ([WRITE_SOURCE_CLIENT, WRITE_SOURCE_FEEDER].includes(this.history.writeSource)) {
        this.emit('connection:read', this.connectionOptions, res.raw);
      }
    });

    this.runner.on('ok', res => {
      log.silly(
        `controller.on('ok'): source=${this.history.writeSource}, line=${JSON.stringify(
          this.history.writeLine
        )}, res=${JSON.stringify(res)}`
      );

      if (res) {
        if ([WRITE_SOURCE_CLIENT, WRITE_SOURCE_FEEDER].includes(this.history.writeSource)) {
          this.emit('connection:read', this.connectionOptions, res.raw);
        } else if (!this.history.writeSource) {
          this.emit('connection:read', this.connectionOptions, res.raw);
          log.error('"history.writeSource" should not be empty');
        }
      }

      this.history.writeSource = null;
      this.history.writeLine = '';

      // Perform preemptive query to prevent starvation
      const now = new Date().getTime();
      const timespan = Math.abs(now - this.query.lastQueryTime);
      if (this.query.type && timespan > 2000) {
        this.query.issue();
        return;
      }

      const {hold, sent, received} = this.sender.state;

      if (this.workflow.state === WORKFLOW_STATE_RUNNING) {
        if (hold && received + 1 >= sent) {
          log.debug(`Continue sending G-code: hold=${hold}, sent=${sent}, received=${received + 1}`);
          this.sender.unhold();
        }
        this.sender.ack();
        this.sender.next();
        return;
      }

      if (this.workflow.state === WORKFLOW_STATE_PAUSED && received < sent) {
        if (!hold) {
          log.error('The sender does not hold off during the paused state');
        }
        if (received + 1 >= sent) {
          log.debug(`Stop sending G-code: hold=${hold}, sent=${sent}, received=${received + 1}`);
        }
        this.sender.ack();
        this.sender.next();
        return;
      }

      // Feeder
      if (this.feeder.next()) {
        return;
      }

      this.query.issue();
    });

    this.runner.on('error', res => {
      // Sender
      if (this.workflow.state === WORKFLOW_STATE_RUNNING) {
        const ignoreErrors = config.get('state.controller.exception.ignoreErrors');
        const pauseError = !ignoreErrors;
        const {lines, received} = this.sender.state;
        const line = lines[received] || '';

        this.emit('connection:read', this.connectionOptions, `> ${line.trim()} (line=${received + 1})`);
        this.emit('connection:read', this.connectionOptions, res.raw);

        if (pauseError) {
          this.workflow.pause({err: res.raw});
        }

        this.sender.ack();
        this.sender.next();

        return;
      }

      this.emit('connection:read', this.connectionOptions, res.raw);

      // Feeder
      this.feeder.next();
    });

    this.runner.on('others', res => {
      this.emit('connection:read', this.connectionOptions, res.raw);
    });

    this.queryTimer = setInterval(() => {
      if (this.isClose) {
        return;
      }

      // Feeder
      if (this.feeder.peek()) {
        this.emit('feeder:status', this.feeder.toJSON());
      }

      // Sender
      if (this.sender.peek()) {
        this.emit('sender:status', this.sender.toJSON());
      }

      const zeroOffset = isEqual(this.runner.getPosition(this.state), this.runner.getPosition(this.runner.state));

      // Marlin settings
      if (this.settings !== this.runner.settings) {
        this.settings = this.runner.settings;
        this.emit('controller:settings', MARLIN, this.settings);
        this.emit('Marlin:settings', this.settings); // Backward compatibility
      }

      // Marlin state
      if (this.state !== this.runner.state) {
        this.state = this.runner.state;
        this.emit('controller:state', MARLIN, this.state);
        this.emit('Marlin:state', this.state); // Backward compatibility
      }

      // Check the ready flag
      if (!this.ready) {
        // Wait for the bootloader to complete before sending commands
        return;
      }

      // M114: Get Current Position
      this.queryPosition();

      // M105: Report Temperatures
      this.queryTemperature();

      {
        // The following criteria must be met to issue a query
        const notBusy = !this.history.writeSource;
        const senderIdle = this.sender.state.sent === this.sender.state.received;
        const feederEmpty = this.feeder.size() === 0;

        if (notBusy && senderIdle && feederEmpty) {
          this.query.issue();
        }
      }

      // Check if the machine has stopped movement after completion
      if (this.senderFinishTime > 0) {
        const machineIdle = zeroOffset;
        const now = new Date().getTime();
        const timespan = Math.abs(now - this.senderFinishTime);
        const toleranceTime = 500; // in milliseconds

        if (!machineIdle) {
          // Extend the sender finish time
          this.senderFinishTime = now;
        } else if (timespan > toleranceTime) {
          log.silly(`Finished sending G-code: timespan=${timespan}`);

          this.senderFinishTime = 0;

          // Stop workflow
          this.command('gcode:stop');
        }
      }
    }, 250);
  }
  populateContext(context) {
    // Work position
    const {x: posx, y: posy, z: posz, e: pose} = this.runner.getPosition();

    // Modal group
    const modal = this.runner.getModalGroup();

    if (!context || isEmpty(context)) {
      return {};
    }

    return Object.assign(context, {
      // Bounding box
      xmin: Number(context.xmin) || 0,
      xmax: Number(context.xmax) || 0,
      ymin: Number(context.ymin) || 0,
      ymax: Number(context.ymax) || 0,
      zmin: Number(context.zmin) || 0,
      zmax: Number(context.zmax) || 0,
      // Work position
      posx: Number(posx) || 0,
      posy: Number(posy) || 0,
      posz: Number(posz) || 0,
      pose: Number(pose) || 0,
      // Modal group
      modal: {
        motion: modal.motion,
        wcs: modal.wcs,
        plane: modal.plane,
        units: modal.units,
        distance: modal.distance,
        feedrate: modal.feedrate,
        program: modal.program,
        spindle: modal.spindle,
        // M7 and M8 may be active at the same time, but a modal group violation might occur when issuing M7 and M8 together on the same line. Using the new line character (\n) to separate lines can avoid this issue.
        coolant: ensureArray(modal.coolant).join('\n'),
      },
    });
  }
  destroy() {
    if (this.queryTimer) {
      clearInterval(this.queryTimer);
      this.queryTimer = null;
    }

    if (this.runner) {
      this.runner.removeAllListeners();
      this.runner = null;
    }

    this.sockets = {};

    if (this.connection) {
      this.connection = null;
    }

    if (this.event) {
      this.event = null;
    }

    if (this.feeder) {
      this.feeder = null;
    }

    if (this.sender) {
      this.sender = null;
    }

    if (this.workflow) {
      this.workflow = null;
    }
  }
  async initController() {
    // Wait for the bootloader to complete before sending commands
    await delay(1000);

    // M115: Get Firmware Version and Capabilities
    this.command('gcode', 'M115');

    this.ready = true;
  }
  open(callback = noop) {
    // Assertion check
    if (this.isOpen) {
      log.error(
        `Cannot open connection: type=${this.connection.type}, settings=${JSON.stringify(this.connection.settings)}`
      );
      return;
    }

    this.connection.on('data', this.connectionEventListener.data);
    this.connection.on('close', this.connectionEventListener.close);
    this.connection.on('error', this.connectionEventListener.error);

    this.connection.open(err => {
      if (err) {
        log.error(
          `Cannot open connection: type=${this.connection.type}, settings=${JSON.stringify(this.connection.settings)}`
        );
        log.error(err);

        this.emit('connection:error', this.connectionOptions, err);

        if (callback) {
          callback(err);
        }

        return;
      }

      this.emit('connection:open', this.connectionOptions);

      // Emit a change event to all connected sockets
      if (this.engine.io) {
        this.engine.io.emit('connection:change', this.connectionOptions, true);
      }

      if (callback) {
        callback();
      }

      log.debug(
        `Connection established: type=${this.connection.type}, settings=${JSON.stringify(this.connection.settings)}`
      );

      this.workflow.stop();

      if (this.sender.state.gcode) {
        // Unload G-code
        this.command('unload');
      }

      // Initialize controller
      this.initController();
    });
  }
  close(callback) {
    // Stop status query
    this.ready = false;

    this.emit('connection:close', this.connectionOptions);

    // Emit a change event to all connected sockets
    if (this.engine.io) {
      this.engine.io.emit('connection:change', this.connectionOptions, false);
    }

    this.connection.removeAllListeners();
    this.connection.close(callback);
  }
  addSocket(socket) {
    if (!socket) {
      log.error('The socket parameter is not specified');
      return;
    }

    log.debug(`Add socket connection: id=${socket.id}`);
    this.sockets[socket.id] = socket;

    // Controller type
    socket.emit('controller:type', this.type);

    // Connection
    if (this.isOpen) {
      socket.emit('connection:open', this.connectionOptions);
    }

    // Controller settings
    if (!isEmpty(this.settings)) {
      socket.emit('controller:settings', this.type, this.settings);
      socket.emit('Marlin:settings', this.settings); // Backward compatibility
    }

    // Controller state
    if (!isEmpty(this.state)) {
      socket.emit('controller:state', this.type, this.state);
      socket.emit('Marlin:state', this.state); // Backward compatibility
    }

    // Feeder status
    if (this.feeder) {
      socket.emit('feeder:status', this.feeder.toJSON());
    }

    // Sender status
    if (this.sender) {
      socket.emit('sender:status', this.sender.toJSON());

      const {name, gcode: content, context} = this.sender.state;

      if (content) {
        socket.emit(
          'sender:load',
          {
            name,
            content,
          },
          context
        );
      }
    }

    // Workflow state
    if (this.workflow) {
      socket.emit('workflow:state', this.workflow.state);
    }
  }
  removeSocket(socket) {
    if (!socket) {
      log.error('The socket parameter is not specified');
      return;
    }

    log.debug(`Remove socket connection: id=${socket.id}`);
    this.sockets[socket.id] = undefined;
    delete this.sockets[socket.id];
  }
  emit(eventName, ...args) {
    Object.keys(this.sockets).forEach(id => {
      const socket = this.sockets[id];
      socket.emit(eventName, ...args);
    });
  }
  command(cmd, ...args) {
    const handler = {
      'sender:load': () => {
        // eslint-disable-next-line prefer-const
        let [name, content, context = {}, callback = noop] = args;
        if (typeof context === 'function') {
          callback = context;
          context = {};
        }

        // G4 P0 or P with a very small value will empty the planner queue and then
        // respond with an ok when the dwell is complete. At that instant, there will
        // be no queued motions, as long as no more commands were sent after the G4.
        // This is the fastest way to do it without having to check the status reports.
        const dwell = '%wait ; Wait for the planner to empty';
        const ok = this.sender.load(name, `${content}\n${dwell}`, context);
        if (!ok) {
          callback(new Error(`Invalid G-code: name=${name}`));
          return;
        }

        this.emit(
          'sender:load',
          {
            name,
            content,
          },
          context
        );

        this.event.trigger('sender:load');

        log.debug(
          `Load G-code: name="${this.sender.state.name}", size=${this.sender.state.gcode.length}, total=${
            this.sender.state.total
          }`
        );

        this.workflow.stop();

        callback(null, this.sender.toJSON());
      },
      'sender:unload': () => {
        this.workflow.stop();

        // Sender
        this.sender.unload();

        this.emit('sender:unload');
        this.event.trigger('sender:unload');
      },
      'sender:start': () => {
        this.event.trigger('sender:start');

        this.workflow.start();

        // Feeder
        this.feeder.reset();

        // Sender
        this.sender.next();
      },
      // @param {object} options The options object.
      // @param {boolean} [options.force] Whether to force stop a G-code program. Defaults to false.
      'sender:stop': () => {
        this.event.trigger('sender:stop');

        this.workflow.stop();
      },
      'sender:pause': () => {
        this.event.trigger('sender:pause');

        this.workflow.pause();
      },
      'sender:resume': () => {
        this.event.trigger('sender:resume');

        this.workflow.resume();
      },
      'feeder:start': () => {
        if (this.workflow.state === WORKFLOW_STATE_RUNNING) {
          return;
        }
        this.feeder.unhold();
        this.feeder.next();
      },
      'feeder:stop': () => {
        this.feeder.reset();
      },
      feedhold: () => {
        this.event.trigger('feedhold');
      },
      cyclestart: () => {
        this.event.trigger('cyclestart');
      },
      homing: () => {
        this.event.trigger('homing');

        this.writeln('G28.2 X Y Z');
      },
      sleep: () => {
        this.event.trigger('sleep');

        // Unupported
      },
      unlock: () => {
        // Unsupported
      },
      reset: () => {
        this.workflow.stop();

        this.feeder.reset();

        // M112: Emergency Stop
        this.writeln('M112');
      },
      // Feed Overrides
      // @param {number} value A percentage value between 10 and 500. A value of zero will reset to 100%.
      'override:feed': () => {
        const [value] = args;
        let feedOverride = this.runner.state.ovF;

        if (value === 0) {
          feedOverride = 100;
        } else if (feedOverride + value > 500) {
          feedOverride = 500;
        } else if (feedOverride + value < 10) {
          feedOverride = 10;
        } else {
          feedOverride += value;
        }
        // M220: Set speed factor override percentage
        this.command('gcode', `M220S${feedOverride}`);

        // enforce state change
        this.runner.state = {
          ...this.runner.state,
          ovF: feedOverride,
        };
      },
      // Spindle Speed Overrides
      // @param {number} value A percentage value between 10 and 500. A value of zero will reset to 100%.
      'override:spindle': () => {
        const [value] = args;
        let spindleOverride = this.runner.state.ovS;

        if (value === 0) {
          spindleOverride = 100;
        } else if (spindleOverride + value > 500) {
          spindleOverride = 500;
        } else if (spindleOverride + value < 10) {
          spindleOverride = 10;
        } else {
          spindleOverride += value;
        }
        // M221: Set extruder factor override percentage
        this.command('gcode', `M221S${spindleOverride}`);

        // enforce state change
        this.runner.state = {
          ...this.runner.state,
          ovS: spindleOverride,
        };
      },
      'override:rapid': () => {
        // Unsupported
      },
      'motor:enable': () => {
        // M17 Enable all stepper motors
        this.command('gcode', 'M17');
      },
      'motor:disable': () => {
        // M18/M84 Disable steppers immediately (until the next move)
        this.command('gcode', 'M18');
      },
      lasertest: () => {
        const [power = 0, duration = 0, maxS = 255] = args;

        if (!power) {
          this.command('gcode', 'M5');
        }

        this.command('gcode', `M3S${ensurePositiveNumber(maxS * (power / 100))}`);

        if (duration > 0) {
          // G4 [P<time in ms>] [S<time in sec>]
          // If both S and P are included, S takes precedence.
          this.command('gcode', `G4 P${ensurePositiveNumber(duration)}`);
          this.command('gcode', 'M5');
        }
      },
      gcode: () => {
        const [commands, context] = args;
        const data = ensureArray(commands)
          .join('\n')
          .split(/\r?\n/)
          .filter(line => {
            if (typeof line !== 'string') {
              return false;
            }

            return line.trim().length > 0;
          });

        this.feeder.feed(data, context);

        {
          // The following criteria must be met to trigger the feeder
          const notBusy = !this.history.writeSource;
          const senderIdle = this.sender.state.sent === this.sender.state.received;
          const feederIdle = !this.feeder.isPending();

          if (notBusy && senderIdle && feederIdle) {
            this.feeder.next();
          }
        }
      },
      'macro:run': () => {
        // eslint-disable-next-line prefer-const
        let [id, context = {}, callback = noop] = args;
        if (typeof context === 'function') {
          callback = context;
          context = {};
        }

        const macros = config.get('macros');
        const macro = find(macros, {id});

        if (!macro) {
          log.error(`Cannot find the macro: id=${id}`);
          return;
        }

        this.event.trigger('macro:run');

        this.command('gcode', macro.content, context);
        callback(null);
      },
      'macro:load': () => {
        // eslint-disable-next-line prefer-const
        let [id, context = {}, callback = noop] = args;
        if (typeof context === 'function') {
          callback = context;
          context = {};
        }

        const macros = config.get('macros');
        const macro = find(macros, {id});

        if (!macro) {
          log.error(`Cannot find the macro: id=${id}`);
          return;
        }

        this.event.trigger('macro:load');

        this.command('gcode:load', macro.name, macro.content, context, callback);
      },
      'watchdir:load': () => {
        const [file, callback = noop] = args;
        const context = {}; // empty context

        monitor.readFile(file, (err, data) => {
          if (err) {
            callback(err);
            return;
          }

          this.command('gcode:load', file, data, context, callback);
        });
      },
    }[cmd];

    if (!handler) {
      log.error(`Unknown command: ${cmd}`);
      return;
    }

    handler();
  }
  write(data, context) {
    // Assertion check
    if (this.isClose) {
      log.error(
        `Unable to write data to the connection: type=${this.connection.type}, settings=${JSON.stringify(
          this.connection.settings
        )}`
      );
      return;
    }

    this.emit('connection:write', this.connectionOptions, data, {
      ...context,
      source: WRITE_SOURCE_CLIENT,
    });
    this.connection.write(data, {
      source: WRITE_SOURCE_CLIENT,
    });
    log.silly(`> ${data}`);
  }
  writeln(data, context) {
    this.write(`${data}\n`, context);
  }
}

export default MarlinController;
