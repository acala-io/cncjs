/* eslint-disable import/default */

import ensureArray from 'ensure-array';
import SerialPort from 'serialport';
import socketIO from 'socket.io';
import socketioJwt from 'socketio-jwt';
import {noop, reverse, sortBy, uniq} from 'lodash';

import EventTrigger from '../../lib/EventTrigger';
import logger from '../../lib/logger';
import {authorizeIPAddress, validateUser} from '../../access-control';
import {toIdent as toSerialIdent} from '../../lib/SerialConnection';
import {toIdent as toSocketIdent} from '../../lib/SocketConnection';

import controllers from '../../store/controllers';
import taskRunner from '../taskrunner';
import {G2CORE, TINYG} from '../../controllers/TinyG/constants';
import {GrblController, MarlinController, SmoothieController, TinyGController} from '../../controllers';
import {GRBL} from '../../controllers/Grbl/constants';
import {MARLIN} from '../../controllers/Marlin/constants';
import {SMOOTHIE} from '../../controllers/Smoothie/constants';

import config from '../configstore';
import settings from '../../config/settings';

const log = logger('service:cncengine');

// Case-insensitive equality checker.
// @param {string} str1 First string to check.
// @param {string} str2 Second string to check.
// @return {boolean} True if str1 and str2 are the same string, ignoring case.
const caseInsensitiveEquals = (str1, str2) => {
  let localStr1 = str1;
  let localStr2 = str2;
  localStr1 = localStr1 ? String(localStr1).toUpperCase() : '';
  localStr2 = localStr2 ? String(localStr2).toUpperCase() : '';

  return localStr1 === localStr2;
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
    configChange: () => {
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
    let localController = controller;
    // Fallback to an empty string if the controller is not valid
    if (!isValidController(localController)) {
      localController = '';
    }

    // Grbl
    if (!localController || caseInsensitiveEquals(GRBL, localController)) {
      this.controllerClass[GRBL] = GrblController;
    }

    // Marlin
    if (!localController || caseInsensitiveEquals(MARLIN, localController)) {
      this.controllerClass[MARLIN] = MarlinController;
    }

    // Smoothie
    if (!localController || caseInsensitiveEquals(SMOOTHIE, localController)) {
      this.controllerClass[SMOOTHIE] = SmoothieController;
    }

    // TinyG / G2core
    if (
      !localController ||
      caseInsensitiveEquals(G2CORE, localController) ||
      caseInsensitiveEquals(TINYG, localController)
    ) {
      this.controllerClass[TINYG] = TinyGController;
    }

    if (Object.keys(this.controllerClass).length === 0) {
      throw new Error(`No valid CNC controller specified (${localController})`);
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
        let localCallback = callback;
        if (typeof localCallback !== 'function') {
          localCallback = noop;
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

          localCallback(null, ports);
        } catch (err) {
          log.error(err);
          localCallback(err);
        }
      });

      // Gets a list of supported baud rates
      // @param {function} callback The error-first callback.
      socket.on('getBaudRates', (callback = noop) => {
        let localCallback = callback;
        if (typeof localCallback !== 'function') {
          localCallback = noop;
        }

        const defaultBaudRates = [250000, 115200, 57600, 38400, 19200, 9600, 2400];
        const customBaudRates = ensureArray(config.get('baudRates', []));
        const baudRates = reverse(sortBy(uniq(customBaudRates.concat(defaultBaudRates))));

        localCallback(null, baudRates);
      });

      socket.on('open', (controllerType = GRBL, connectionType = 'serial', options, callback = noop) => {
        let localControllerType = controllerType;
        let localOptions = options;
        let localCallback = callback;
        if (typeof localCallback !== 'function') {
          localCallback = noop;
        }

        localOptions = {...localOptions};

        log.debug(
          `socket.open("${localControllerType}", "${connectionType}", ${JSON.stringify(localOptions)}): id=${socket.id}`
        );

        let ident = '';

        if (connectionType === 'serial') {
          ident = toSerialIdent(localOptions);
        } else if (connectionType === 'socket') {
          ident = toSocketIdent(localOptions);
        }

        if (!ident) {
          const err = new Error('Invalid connection identifier');
          log.error(err);
          localCallback(err);
          return;
        }

        let controller = controllers[ident];
        if (!controller) {
          if (localControllerType === 'TinyG2') {
            // TinyG2 is deprecated and will be removed in a future release
            localControllerType = TINYG;
          }

          const Controller = this.controllerClass[localControllerType];
          if (!Controller) {
            const err = `Not supported controller: ${localControllerType}`;
            log.error(err);
            localCallback(new Error(err));
            return;
          }

          const engine = this;
          controller = new Controller(engine, connectionType, localOptions);
        }

        controller.addSocket(socket);

        if (controller.isOpen) {
          // Join the room
          socket.join(ident);

          localCallback(null, ident);
          return;
        }

        controller.open((err = null) => {
          if (err) {
            localCallback(err);
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

          localCallback(null, ident);
        });
      });

      socket.on('close', (ident, callback = noop) => {
        let localCallback = callback;
        if (typeof localCallback !== 'function') {
          localCallback = noop;
        }

        log.debug(`socket.close("${ident}"): id=${socket.id}`);

        const controller = controllers[ident];
        if (!controller) {
          log.error(`The connection is not accessible: ident=${ident}`);
          localCallback(new Error(`The connection is not accessible: ident=${ident}`));
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

          localCallback();
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
