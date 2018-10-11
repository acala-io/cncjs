/* eslint-disable import/default */

import ensureArray from 'ensure-array';
import noop from 'lodash/noop';
import reverse from 'lodash/reverse';
import SerialPort from 'serialport';
import socketIO from 'socket.io';
import socketioJwt from 'socketio-jwt';
import sortBy from 'lodash/sortBy';
import uniq from 'lodash/uniq';

import config from '../configstore';
import controllers from '../../store/controllers';
import EventTrigger from '../../lib/EventTrigger';
import logger from '../../lib/logger';
import settings from '../../config/settings';
import taskRunner from '../taskrunner';
import {authorizeIPAddress, validateUser} from '../../access-control';
import {G2CORE, TINYG} from '../../controllers/TinyG/constants';
import {GrblController, MarlinController, SmoothieController, TinyGController} from '../../controllers';
import {GRBL} from '../../controllers/Grbl/constants';
import {MARLIN} from '../../controllers/Marlin/constants';
import {SMOOTHIE} from '../../controllers/Smoothie/constants';
import {toIdent as toSerialIdent} from '../../lib/SerialConnection';
import {toIdent as toSocketIdent} from '../../lib/SocketConnection';

const log = logger('service:cncengine');

// Case-insensitive equality checker.
// @param {string} str1 First string to check.
// @param {string} str2 Second string to check.
// @return {boolean} True if str1 and str2 are the same string, ignoring case.
const caseInsensitiveEquals = (str1, str2) => {
  str1 = str1 ? String(str1).toUpperCase() : '';
  str2 = str2 ? String(str2).toUpperCase() : '';

  return str1 === str2;
};

const isValidController = controller =>
  // Grbl
  caseInsensitiveEquals(GRBL, controller) ||
  // Marlin
  caseInsensitiveEquals(MARLIN, controller) ||
  // Smoothie
  caseInsensitiveEquals(SMOOTHIE, controller) ||
  // g2core
  caseInsensitiveEquals(G2CORE, controller) ||
  // TinyG
  caseInsensitiveEquals(TINYG, controller);

class CNCEngine {
  controllerClass = {};
  listener = {
    taskStart: (...args) => {
      if (this.io) {
        this.io.emit('task:start', ...args);
      }
    },
    taskFinish: (...args) => {
      if (this.io) {
        this.io.emit('task:finish', ...args);
      }
    },
    taskError: (...args) => {
      if (this.io) {
        this.io.emit('task:error', ...args);
      }
    },
    configChange: (...args) => {
      if (this.io) {
        this.io.emit('config:change');
      }
    },
  };
  server = null;
  io = null;
  sockets = [];

  // Event Trigger
  event = new EventTrigger((event, trigger, commands) => {
    log.debug(`EventTrigger: event="${event}", trigger="${trigger}", commands="${commands}"`);
    if (trigger === 'system') {
      taskRunner.run(commands);
    }
  });

  // @param {object} server The HTTP server instance.
  // @param {string} controller Specify CNC controller.
  start(server, controller = '') {
    // Fallback to an empty string if the controller is not valid
    if (!isValidController(controller)) {
      controller = '';
    }

    // Grbl
    if (!controller || caseInsensitiveEquals(GRBL, controller)) {
      this.controllerClass[GRBL] = GrblController;
    }

    // Marlin
    if (!controller || caseInsensitiveEquals(MARLIN, controller)) {
      this.controllerClass[MARLIN] = MarlinController;
    }

    // Smoothie
    if (!controller || caseInsensitiveEquals(SMOOTHIE, controller)) {
      this.controllerClass[SMOOTHIE] = SmoothieController;
    }

    // TinyG / G2core
    if (!controller || caseInsensitiveEquals(G2CORE, controller) || caseInsensitiveEquals(TINYG, controller)) {
      this.controllerClass[TINYG] = TinyGController;
    }

    if (Object.keys(this.controllerClass).length === 0) {
      throw new Error(`No valid CNC controller specified (${controller})`);
    }

    const availableControllers = Object.keys(this.controllerClass);
    log.debug(`Available controllers: ${availableControllers}`);

    this.stop();

    taskRunner.on('start', this.listener.taskStart);
    taskRunner.on('finish', this.listener.taskFinish);
    taskRunner.on('error', this.listener.taskError);
    config.on('change', this.listener.configChange);

    // System Trigger: Startup
    this.event.trigger('startup');

    this.server = server;
    this.io = socketIO(this.server, {
      path: '/socket.io',
      serveClient: true,
    });

    this.io.use(
      socketioJwt.authorize({
        handshake: true,
        secret: settings.secret,
      })
    );

    this.io.use(async (socket, next) => {
      try {
        // IP Address Access Control
        const ipaddr = socket.handshake.address;
        await authorizeIPAddress(ipaddr);

        // User Validation
        const user = socket.decoded_token || {};
        await validateUser(user);
      } catch (err) {
        log.warn(err);
        next(err);
        return;
      }

      next();
    });

    this.io.on('connection', socket => {
      const address = socket.handshake.address;
      const user = socket.decoded_token || {};
      log.debug(`New connection from ${address}: id=${socket.id}, user.id=${user.id}, user.name=${user.name}`);

      // Add to the socket pool
      this.sockets.push(socket);

      socket.emit('startup', {
        availableControllers: Object.keys(this.controllerClass),
      });

      socket.on('disconnect', () => {
        log.debug(`Disconnected from ${address}: id=${socket.id}, user.id=${user.id}, user.name=${user.name}`);

        Object.keys(controllers).forEach(ident => {
          const controller = controllers[ident];
          if (!controller) {
            return;
          }
          controller.removeSocket(socket);
        });

        // Remove from socket pool
        this.sockets.splice(this.sockets.indexOf(socket), 1);
      });

      // Gets a list of available serial ports
      // @param {function} callback The error-first callback.
      socket.on('getPorts', async (callback = noop) => {
        if (typeof callback !== 'function') {
          callback = noop;
        }

        log.debug(`socket.getPorts(): id=${socket.id}`);

        try {
          const activeControllers = Object.keys(controllers).filter(ident => {
            const controller = controllers[ident];
            return controller && controller.isOpen;
          });
          const availablePorts = ensureArray(await SerialPort.list());
          const customPorts = ensureArray(config.get('ports', []));
          const ports = []
            .concat(availablePorts)
            .concat(customPorts)
            .map(port => {
              const {comName, manufacturer} = {...port};

              return {
                comName,
                isOpen: activeControllers.indexOf(comName) >= 0,
                manufacturer,
              };
            })
            .filter(port => Boolean(port.comName));

          callback(null, ports);
        } catch (err) {
          log.error(err);
          callback(err);
        }
      });

      // Gets a list of supported baud rates
      // @param {function} callback The error-first callback.
      socket.on('getBaudRates', (callback = noop) => {
        if (typeof callback !== 'function') {
          callback = noop;
        }

        const defaultBaudRates = [250000, 115200, 57600, 38400, 19200, 9600, 2400];
        const customBaudRates = ensureArray(config.get('baudRates', []));
        const baudRates = reverse(sortBy(uniq(customBaudRates.concat(defaultBaudRates))));

        callback(null, baudRates);
      });

      socket.on('open', (controllerType = GRBL, connectionType = 'serial', options, callback = noop) => {
        if (typeof callback !== 'function') {
          callback = noop;
        }

        options = {...options};

        log.debug(`socket.open("${controllerType}", "${connectionType}", ${JSON.stringify(options)}): id=${socket.id}`);

        let ident = '';

        if (connectionType === 'serial') {
          ident = toSerialIdent(options);
        } else if (connectionType === 'socket') {
          ident = toSocketIdent(options);
        }

        if (!ident) {
          const err = new Error('Invalid connection identifier');
          log.error(err);
          callback(err);
          return;
        }

        let controller = controllers[ident];
        if (!controller) {
          if (controllerType === 'TinyG2') {
            // TinyG2 is deprecated and will be removed in a future release
            controllerType = TINYG;
          }

          const Controller = this.controllerClass[controllerType];
          if (!Controller) {
            const err = `Not supported controller: ${controllerType}`;
            log.error(err);
            callback(new Error(err));
            return;
          }

          const engine = this;
          controller = new Controller(engine, connectionType, options);
        }

        controller.addSocket(socket);

        if (controller.isOpen) {
          // Join the room
          socket.join(ident);

          callback(null, ident);
          return;
        }

        controller.open((err = null) => {
          if (err) {
            callback(err);
            return;
          }

          // System Trigger: Open connection
          this.event.trigger('connection:open');

          if (controllers[ident]) {
            log.error(`The connection was not properly closed: ident=${ident}`);
            delete controllers[ident];
          }
          controllers[ident] = controller;

          // Join the room
          socket.join(ident);

          callback(null, ident);
        });
      });

      socket.on('close', (ident, callback = noop) => {
        if (typeof callback !== 'function') {
          callback = noop;
        }

        log.debug(`socket.close("${ident}"): id=${socket.id}`);

        const controller = controllers[ident];
        if (!controller) {
          log.error(`The connection is not accessible: ident=${ident}`);
          callback(new Error(`The connection is not accessible: ident=${ident}`));
          return;
        }

        // System Trigger: Close connection
        this.event.trigger('connection:close');

        // Leave the room
        socket.leave(ident);

        controller.close(() => {
          // Remove controller from store
          delete controllers[ident];
          controllers[ident] = undefined;

          // Destroy controller
          controller.destroy();

          callback();
        });
      });

      socket.on('command', (ident, cmd, ...args) => {
        log.debug(`socket.command("${ident}", "${cmd}"): id=${socket.id}`);

        const controller = controllers[ident];
        if (!controller || controller.isClose) {
          log.error(`The connection is not accessible: ident=${ident}`);
          return;
        }

        controller.command.apply(controller, [cmd].concat(args));
      });

      socket.on('write', (ident, data, context = {}) => {
        log.debug(`socket.write("${ident}", "${data}", ${JSON.stringify(context)}): id=${socket.id}`);

        const controller = controllers[ident];
        if (!controller || controller.isClose) {
          log.error(`The connection is not accessible: ${ident}`);
          return;
        }

        controller.write(data, context);
      });

      socket.on('writeln', (ident, data, context = {}) => {
        log.debug(`socket.writeln("${ident}", "${data}", ${JSON.stringify(context)}): id=${socket.id}`);

        const controller = controllers[ident];
        if (!controller || controller.isClose) {
          log.error(`The connection is not accessible: ${ident}`);
          return;
        }

        controller.writeln(data, context);
      });
    });
  }

  stop() {
    if (this.io) {
      this.io.close();
      this.io = null;
    }
    this.sockets = [];
    this.server = null;

    taskRunner.removeListener('start', this.listener.taskStart);
    taskRunner.removeListener('finish', this.listener.taskFinish);
    taskRunner.removeListener('error', this.listener.taskError);
    config.removeListener('change', this.listener.configChange);
  }
}

export default CNCEngine;
