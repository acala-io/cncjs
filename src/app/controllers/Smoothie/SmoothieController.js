/* eslint-disable import/default */

import * as parser from 'gcode-parser';
import { get, includes, intersection, throttle, isEqual, isEmpty } from 'lodash';
import ensureArray from 'ensure-array';

import delay from '../../lib/delay';
import ensurePositiveNumber from '../../lib/ensure-positive-number';
import evaluateExpression from '../../lib/evaluate-expression';
import EventTrigger from '../../lib/EventTrigger';
import Feeder from '../../lib/Feeder';
import logger from '../../lib/logger';
import monitor from '../../services/monitor';
import Sender, {SP_TYPE_CHAR_COUNTING} from '../../lib/Sender';
import SerialConnection from '../../lib/SerialConnection';
import SocketConnection from '../../lib/SocketConnection';
import translateExpression from '../../lib/translate-expression';
import Workflow, {WORKFLOW_STATE_IDLE, WORKFLOW_STATE_PAUSED, WORKFLOW_STATE_RUNNING} from '../../lib/Workflow';

import config from '../../services/configstore';
import taskRunner from '../../services/taskrunner';

import controllers from '../../store/controllers';

import {SMOOTHIE, SMOOTHIE_MACHINE_STATE_HOLD, SMOOTHIE_REALTIME_COMMANDS} from './constants';
import {WRITE_SOURCE_CLIENT, WRITE_SOURCE_FEEDER} from '../constants';

import SmoothieRunner from './SmoothieRunner';

// % commands
const WAIT = '%wait';

const log = logger('controller:Smoothie');
const noop = _.noop;

class SmoothieController {
  type = SMOOTHIE;

  // CNCEngine
  engine = null;

  // Sockets
  sockets = {};

  // Connection
  connection = null;
  connectionEventListener = {
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
    data: data => {
      log.silly(`< ${data}`);
      this.runner.parse(String(data));
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

  // Smoothie
  controller = null;
  ready = false;
  state = {};
  settings = {};
  queryTimer = null;
  actionMask = {
    queryParserState: {
      reply: false, // wait for an `ok` or `error` response
      state: false, // wait for a message containing the current G-code parser modal state
    },
    queryStatusReport: false,

    // Respond to user input
    replyParserState: false, // $G
    replyStatusReport: false, // ?
  };
  actionTime = {
    queryParserState: 0,
    queryStatusReport: 0,
    senderFinishTime: 0,
  };
  feedOverride = 100;
  spindleOverride = 100;

  // Event Trigger
  event = null;

  // Feeder
  feeder = null;

  // Sender
  sender = null;

  // Workflow
  workflow = null;

  get connectionOptions() {
    return {
      ident: this.connection.ident,
      settings: this.connection.settings,
      type: this.connection.type,
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
    if (!engine) {
      throw new TypeError(`"engine" must be specified: ${engine}`);
    }

    if (!includes(['serial', 'socket'], connectionType)) {
      throw new TypeError(`"connectionType" is invalid: ${connectionType}`);
    }

    // Engine
    this.engine = engine;

    // Connection
    if (connectionType === 'serial') {
      this.connection = new SerialConnection({
        ...options,
        writeFilter: data => data,
      });
    } else if (connectionType === 'socket') {
      this.connection = new SocketConnection({
        ...options,
        writeFilter: data => data,
      });
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
            return 'G4 P0.5'; // dwell
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
        if (includes(words, 'M6')) {
          log.debug('M6 Tool Change');
          this.feeder.hold({data: 'M6'}); // Hold reason
        }

        return localLine;
      },
    });
    this.feeder.on('data', (line = '', context = {}) => {
      let localLine = line;
      if (this.isClose) {
        log.error(
          `Unable to write data to the connection: type=${this.connection.type}, settings=${JSON.stringify(
            this.connection.settings
          )}`
        );
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

      this.connection.write(`${localLine}\n`);
      log.silly(`> ${localLine}`);
    });
    this.feeder.on('hold', noop);
    this.feeder.on('unhold', noop);

    // Sender
    this.sender = new Sender(SP_TYPE_CHAR_COUNTING, {
      // Deduct the buffer size to prevent from buffer overrun
      bufferSize: 128 - 8, // The default buffer size is 128 bytes
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
            return 'G4 P0.5'; // dwell
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
        if (includes(words, 'M6')) {
          log.debug(`M6 Tool Change: line=${sent + 1}, sent=${sent}, received=${received}`);
          this.workflow.pause({data: 'M6'});
        }

        return localLine;
      },
    });
    this.sender.on('data', (line = '') => {
      let localLine = line;
      if (this.isClose) {
        log.error(
          `Unable to write data to the connection: type=${this.connection.type}, settings=${JSON.stringify(
            this.connection.settings
          )}`
        );
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

      this.connection.write(`${localLine}\n`);
      log.silly(`> ${localLine}`);
    });
    this.sender.on('hold', noop);
    this.sender.on('unhold', noop);
    this.sender.on('start', () => {
      this.actionTime.senderFinishTime = 0;
    });
    this.sender.on('end', finishTime => {
      this.actionTime.senderFinishTime = finishTime;
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

    // Smoothie
    this.runner = new SmoothieRunner();

    this.runner.on('raw', noop);

    this.runner.on('status', res => {
      this.actionMask.queryStatusReport = false;

      if (this.actionMask.replyStatusReport) {
        this.actionMask.replyStatusReport = false;
        this.emit('connection:read', this.connectionOptions, res.raw);
      }

      // Check if the receive buffer is available in the status report (#115)
      // @see https://github.com/cncjs/cncjs/issues/115
      // @see https://github.com/cncjs/cncjs/issues/133
      const rx = Number(get(res, 'buf.rx', 0)) || 0;
      if (rx > 0) {
        // Do not modify the buffer size when running a G-code program
        if (this.workflow.state !== WORKFLOW_STATE_IDLE) {
          return;
        }

        // Check if the streaming protocol is character-counting streaming protocol
        if (this.sender.sp.type !== SP_TYPE_CHAR_COUNTING) {
          return;
        }

        // Check if the queue is empty
        if (this.sender.sp.dataLength !== 0) {
          return;
        }

        // Deduct the receive buffer length to prevent from buffer overrun
        const bufferSize = rx - 8; // TODO
        if (bufferSize > this.sender.sp.bufferSize) {
          this.sender.sp.bufferSize = bufferSize;
        }
      }
    });

    this.runner.on('ok', res => {
      if (this.actionMask.queryParserState.reply) {
        if (this.actionMask.replyParserState) {
          this.actionMask.replyParserState = false;
          this.emit('connection:read', this.connectionOptions, res.raw);
        }
        this.actionMask.queryParserState.reply = false;
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

      this.emit('connection:read', this.connectionOptions, res.raw);

      // Feeder
      this.feeder.next();
    });

    this.runner.on('error', res => {
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

    this.runner.on('alarm', res => {
      this.emit('connection:read', this.connectionOptions, res.raw);
    });

    this.runner.on('parserstate', res => {
      this.actionMask.queryParserState.state = false;
      this.actionMask.queryParserState.reply = true;

      if (this.actionMask.replyParserState) {
        this.emit('connection:read', this.connectionOptions, res.raw);
      }
    });

    this.runner.on('parameters', res => {
      this.emit('connection:read', this.connectionOptions, res.raw);
    });

    this.runner.on('version', res => {
      this.emit('connection:read', this.connectionOptions, res.raw);
    });

    this.runner.on('others', res => {
      this.emit('connection:read', this.connectionOptions, res.raw);
    });

    const queryStatusReport = () => {
      // Check the ready flag
      if (!this.ready) {
        return;
      }

      const now = new Date().getTime();

      // The status report query (?) is a realtime command, it does not consume the receive buffer.
      const lastQueryTime = this.actionTime.queryStatusReport;
      if (lastQueryTime > 0) {
        const timespan = Math.abs(now - lastQueryTime);
        const toleranceTime = 5000; // 5 seconds

        // Check if it has not been updated for a long time
        if (timespan >= toleranceTime) {
          log.debug(`Continue status report query: timespan=${timespan}ms`);
          this.actionMask.queryStatusReport = false;
        }
      }

      if (this.actionMask.queryStatusReport) {
        return;
      }

      if (this.isOpen) {
        this.actionMask.queryStatusReport = true;
        this.actionTime.queryStatusReport = now;
        this.connection.write('?');
      }
    };

    // The throttle function is executed on the trailing edge of the timeout,
    // the function might be executed even if the query timer has been destroyed.
    const queryParserState = throttle(() => {
      // Check the ready flag
      if (!this.ready) {
        return;
      }

      const now = new Date().getTime();

      // Do not force query parser state ($G) when running a G-code program,
      // it will consume 3 bytes from the receive buffer in each time period.
      // @see https://github.com/cncjs/cncjs/issues/176
      // @see https://github.com/cncjs/cncjs/issues/186
      if (this.workflow.state === WORKFLOW_STATE_IDLE && this.runner.isIdle()) {
        const lastQueryTime = this.actionTime.queryParserState;
        if (lastQueryTime > 0) {
          const timespan = Math.abs(now - lastQueryTime);
          const toleranceTime = 10000; // 10 seconds

          // Check if it has not been updated for a long time
          if (timespan >= toleranceTime) {
            log.debug(`Continue parser state query: timespan=${timespan}ms`);
            this.actionMask.queryParserState.state = false;
            this.actionMask.queryParserState.reply = false;
          }
        }
      }

      if (this.actionMask.queryParserState.state || this.actionMask.queryParserState.reply) {
        return;
      }

      if (this.isOpen) {
        this.actionMask.queryParserState.state = true;
        this.actionMask.queryParserState.reply = false;
        this.actionTime.queryParserState = now;
        this.connection.write('$G\n');
      }
    }, 500);

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

      const zeroOffset = isEqual(
        this.runner.getWorkPosition(this.state),
        this.runner.getWorkPosition(this.runner.state)
      );

      // Smoothie settings
      if (this.settings !== this.runner.settings) {
        this.settings = this.runner.settings;
        this.emit('controller:settings', this.type, this.settings);
        this.emit('Smoothie:settings', this.settings); // Backward compatibility
      }

      // Smoothie state
      if (this.state !== this.runner.state) {
        this.state = this.runner.state;
        this.emit('controller:state', this.type, this.state);
        this.emit('Smoothie:state', this.state); // Backward compatibility
      }

      // Check the ready flag
      if (!this.ready) {
        // Wait for the bootloader to complete before sending commands
        return;
      }

      // ? - Status Report
      queryStatusReport();

      // $G - Parser State
      queryParserState();

      // Check if the machine has stopped movement after completion
      if (this.actionTime.senderFinishTime > 0) {
        const machineIdle = zeroOffset && this.runner.isIdle();
        const now = new Date().getTime();
        const timespan = Math.abs(now - this.actionTime.senderFinishTime);
        const toleranceTime = 500; // in milliseconds

        if (!machineIdle) {
          // Extend the sender finish time
          this.actionTime.senderFinishTime = now;
        } else if (timespan > toleranceTime) {
          log.silly(`Finished sending G-code: timespan=${timespan}`);

          this.actionTime.senderFinishTime = 0;

          // Stop workflow
          this.command('sender:stop');
        }
      }
    }, 250);
  }
  populateContext(context) {
    // Machine position
    const {x: mposx, y: mposy, z: mposz, a: mposa, b: mposb, c: mposc} = this.runner.getMachinePosition();

    // Work position
    const {x: posx, y: posy, z: posz, a: posa, b: posb, c: posc} = this.runner.getWorkPosition();

    // Modal group
    const modal = this.runner.getModalGroup();

    return Object.assign(context || {}, {
      // Bounding box
      xmin: Number(context.xmin) || 0,
      xmax: Number(context.xmax) || 0,
      ymin: Number(context.ymin) || 0,
      ymax: Number(context.ymax) || 0,
      zmin: Number(context.zmin) || 0,
      zmax: Number(context.zmax) || 0,
      // Machine position
      mposx: Number(mposx) || 0,
      mposy: Number(mposy) || 0,
      mposz: Number(mposz) || 0,
      mposa: Number(mposa) || 0,
      mposb: Number(mposb) || 0,
      mposc: Number(mposc) || 0,
      // Work position
      posx: Number(posx) || 0,
      posy: Number(posy) || 0,
      posz: Number(posz) || 0,
      posa: Number(posa) || 0,
      posb: Number(posb) || 0,
      posc: Number(posc) || 0,
      // Modal state
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
  clearActionValues() {
    this.actionMask.queryParserState.state = false;
    this.actionMask.queryParserState.reply = false;
    this.actionMask.queryStatusReport = false;
    this.actionMask.replyParserState = false;
    this.actionMask.replyStatusReport = false;
    this.actionTime.queryParserState = 0;
    this.actionTime.queryStatusReport = 0;
    this.actionTime.senderFinishTime = 0;
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

    // Check if it is Smoothieware
    this.command('gcode', 'version');

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

      // Clear action values
      this.clearActionValues();

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
      socket.emit('Smoothie:settings', this.settings); // Backward compatibility
    }

    // Controller state
    if (!isEmpty(this.state)) {
      socket.emit('controller:state', this.type, this.state);
      socket.emit('Smoothie:state', this.state); // Backward compatibility
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
            content,
            name,
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
            content,
            name,
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

        const machineState = get(this.state, 'machineState', '');
        if (machineState === SMOOTHIE_MACHINE_STATE_HOLD) {
          this.write('~'); // resume
        }
      },
      'sender:pause': () => {
        this.event.trigger('sender:pause');

        this.workflow.pause();

        this.write('!');
      },
      'sender:resume': () => {
        this.event.trigger('sender:resume');

        this.write('~');

        this.workflow.resume();
      },
      'feeder:start': () => {
        if (this.workflow.state === WORKFLOW_STATE_RUNNING) {
          return;
        }
        this.write('~');
        this.feeder.unhold();
        this.feeder.next();
      },
      'feeder:stop': () => {
        this.feeder.reset();
      },
      feedhold: () => {
        this.event.trigger('feedhold');

        this.write('!');
      },
      cyclestart: () => {
        this.event.trigger('cyclestart');

        this.write('~');
      },
      homing: () => {
        this.event.trigger('homing');

        this.writeln('$H');
      },
      sleep: () => {
        this.event.trigger('sleep');

        // Not supported
      },
      unlock: () => {
        this.writeln('$X');
      },
      reset: () => {
        this.workflow.stop();

        this.feeder.reset();

        this.write('\x18'); // ^x
      },
      // Feed Overrides
      // @param {number} value A percentage value between 10 and 200. A value of zero will reset to 100%.
      'override:feed': () => {
        const [value] = args;
        let feedOverride = this.runner.state.status.ovF;

        if (value === 0) {
          feedOverride = 100;
        } else if (feedOverride + value > 200) {
          feedOverride = 200;
        } else if (feedOverride + value < 10) {
          feedOverride = 10;
        } else {
          feedOverride += value;
        }
        this.command('gcode', `M220S${feedOverride}`);

        // enforce state change
        this.runner.state = {
          ...this.runner.state,
          status: {
            ...this.runner.state.status,
            ovF: feedOverride,
          },
        };
      },
      // Spindle Speed Overrides
      // @param {number} value A percentage value between 10 and 200. A value of zero will reset to 100%.
      'override:spindle': () => {
        const [value] = args;
        let spindleOverride = this.runner.state.status.ovS;

        if (value === 0) {
          spindleOverride = 100;
        } else if (spindleOverride + value > 200) {
          spindleOverride = 200;
        } else if (spindleOverride + value < 10) {
          spindleOverride = 10;
        } else {
          spindleOverride += value;
        }
        this.command('gcode', `M221S${spindleOverride}`);

        // enforce state change
        this.runner.state = {
          ...this.runner.state,
          status: {
            ...this.runner.state.status,
            ovS: spindleOverride,
          },
        };
      },
      // Rapid Overrides
      'override:rapid': () => {
        // Not supported
      },
      lasertest: () => {
        const [power = 0, duration = 0] = args;

        if (!power) {
          // Turning laser off and returning to auto mode
          this.command('gcode', 'fire off');
          this.command('gcode', 'M5');
          return;
        }

        this.command('gcode', 'M3');
        // Firing laser at <power>% power and entering manual mode
        this.command('gcode', `fire ${ensurePositiveNumber(power)}`);
        if (duration > 0) {
          // http://smoothieware.org/g4
          // Dwell S<seconds> or P<milliseconds>
          // Note that if `grbl_mode` is set to `true`, then the `P` parameter
          // is the duration to wait in seconds, not milliseconds, as a float value.
          // This is to confirm to G-code standards.
          this.command('gcode', `G4P${ensurePositiveNumber(duration / 1000)}`);
          // Turning laser off and returning to auto mode
          this.command('gcode', 'fire off');
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

        if (!this.feeder.isPending()) {
          this.feeder.next();
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
        const macro = macros.find({id});

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
        const macro = macros.find({id});

        if (!macro) {
          log.error(`Cannot find the macro: id=${id}`);
          return;
        }

        this.event.trigger('macro:load');

        this.command('sender:load', macro.name, macro.content, context, callback);
      },
      'watchdir:load': () => {
        const [file, callback = noop] = args;
        const context = {}; // empty context

        monitor.readFile(file, (err, data) => {
          if (err) {
            callback(err);
            return;
          }

          this.command('sender:load', file, data, context, callback);
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

    const cmd = data.trim();
    this.actionMask.replyStatusReport = cmd === '?' || this.actionMask.replyStatusReport;
    this.actionMask.replyParserState = cmd === '$G' || this.actionMask.replyParserState;

    this.emit('connection:write', this.connectionOptions, data, {
      ...context,
      source: WRITE_SOURCE_CLIENT,
    });
    this.connection.write(data);
    log.silly(`> ${data}`);
  }

  writeln(data, context) {
    if (includes(SMOOTHIE_REALTIME_COMMANDS, data)) {
      this.write(data, context);
    } else {
      this.write(`${data}\n`, context);
    }
  }
}

export default SmoothieController;
