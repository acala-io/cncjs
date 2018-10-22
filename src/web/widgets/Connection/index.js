import classcat from 'classcat';
import PropTypes from 'prop-types';
import React, {PureComponent} from 'react';
import {includes, map, reverse, sortBy, uniq} from 'lodash';

import controller from '../../lib/controller';
import i18n from '../../lib/i18n';
import log from '../../lib/log';
import promisify from '../../lib/promisify';

import Card from '../../components_new/Card';
import Connection from './Connection';
import Padding from '../../components_new/Padding';
import WidgetConfig from '../WidgetConfig';
import {WidgetHeader, WidgetName} from '../WidgetHeader';

class ConnectionWidget extends PureComponent {
  static propTypes = {
    widgetId: PropTypes.string.isRequired,
  };

  config = new WidgetConfig(this.props.widgetId);

  state = this.getInitialState();

  getInitialState() {
    let controllerType = this.config.get('controller.type');
    if (!includes(controller.availableControllers, controllerType)) {
      controllerType = controller.availableControllers[0];
    }

    const defaultBaudRates = [250000, 115200, 57600, 38400, 19200, 9600, 2400];

    return {
      alertMessage: '',
      autoReconnect: this.config.get('autoReconnect'),
      baudRates: defaultBaudRates,
      connected: false,
      connecting: false,
      connection: {
        serial: {
          baudRate: this.config.get('connection.serial.baudRate'),
          path: this.config.get('connection.serial.path'),
          rtscts: this.config.get('connection.serial.rtscts'),
        },
        socket: {
          host: this.config.get('connection.socket.host'),
          port: this.config.get('connection.socket.port'),
        },
        type: this.config.get('connection.type'),
      },
      controller: {
        type: this.config.get('controller.type'),
      },
      loading: false,
      minimized: this.config.get('minimized', false),
      ports: [],
    };
  }

  render() {
    const {minimized} = this.state;

    const state = {...this.state};
    const actions = {...this.actions};

    return (
      <Card noPad shadow>
        <WidgetHeader>
          <WidgetName name={i18n._('Connection')} onClick={actions.toggleMinimized} />
        </WidgetHeader>
        <div className={classcat([{hidden: minimized}])}>
          <Padding size="small">
            <Connection state={state} actions={actions} />
          </Padding>
        </div>
      </Card>
    );
  }

  collapse = () => {
    this.setState({minimized: true});
  };

  expand = () => {
    this.setState({minimized: false});
  };

  actions = {
    changeController: controllerType => {
      this.setState(state => ({
        controller: {
          ...state.controller,
          type: controllerType,
        },
      }));
    },
    clearAlert: () => {
      this.setState({
        alertMessage: '',
      });
    },
    handleClosePort: () => {
      this.closePort();
    },
    handleOpenPort: () => {
      this.openPort();
    },
    handleRefresh: () => {
      this.refresh();
    },
    onChangeBaudRateOption: baudRate => {
      console.log('baudRate', baudRate);

      this.setState(state => ({
        alertMessage: '',
        connection: {
          ...state.connection,
          serial: {
            ...state.connection.serial,
            baudRate,
          },
        },
      }));
    },
    onChangePortOption: option => {
      this.setState(state => ({
        alertMessage: '',
        connection: {
          ...state.connection,
          serial: {
            ...state.connection.serial,
            path: option.value,
          },
        },
      }));
    },
    toggleAutoReconnect: checked => {
      this.setState({
        autoReconnect: checked,
      });
    },
    toggleHardwareFlowControl: checked => {
      this.setState(state => ({
        connection: {
          ...state.connection,
          serial: {
            ...state.connection.serial,
            rtscts: checked,
          },
        },
      }));
    },
    toggleMinimized: () => {
      this.setState({
        minimized: !this.state.minimized,
      });
    },
  };

  controllerEvents = {
    'connection:open': options => {
      const {settings, type} = options;

      if (type === 'serial') {
        log.debug(`A new connection was established: type=${type}, settings=${settings}`);

        this.setState(state => ({
          alertMessage: '',
          connected: true,
          connecting: false,
          ports: state.ports.map(port => {
            if (port.comName !== settings.path) {
              return port;
            }

            return {...port, isOpen: true};
          }),
        }));
      }
    },
    'connection:close': options => {
      const {settings, type} = options;

      if (type === 'serial') {
        log.debug(`The connection was closed: type=${type}, settings=${settings}`);

        this.setState(state => ({
          alertMessage: '',
          connected: false,
          connecting: false,
          ports: state.ports.map(port => {
            if (port.comName !== settings.path) {
              return port;
            }

            return {...port, isOpen: false};
          }),
        }));

        this.refresh();
      }
    },
    'connection:change': (options, isOpen) => {
      const {settings, type} = options;

      if (type === 'serial') {
        this.setState(state => ({
          ports: state.ports.map(port => {
            if (port.comName !== settings.path) {
              return port;
            }

            return {...port, isOpen};
          }),
        }));
      }
    },
    'connection:error': options => {
      const {settings, type} = options;

      if (type === 'serial') {
        log.error(`Error opening serial port: type=${type}, settings=${settings}`);

        this.setState({
          alertMessage: i18n._('Error opening serial port: {{-path}}', {path: settings.path}),
          connected: false,
          connecting: false,
        });
      }
    },
  };

  componentDidMount() {
    this.addControllerEvents();
    this.refresh({autoConnect: true});
  }

  componentWillUnmount() {
    this.removeControllerEvents();
  }

  componentDidUpdate(prevProps, prevState) {
    this.config.set('minimized', this.state.minimized);

    // Controller
    if (this.state.controller.type) {
      this.config.set('controller.type', this.state.controller.type);
    }

    {
      // Serial connection
      if (this.state.connection.serial.path !== prevState.connection.serial.path) {
        this.config.set('connection.serial.path', this.state.connection.serial.path);
      }
      if (this.state.connection.serial.baudRate !== prevState.connection.serial.baudRate) {
        this.config.set('connection.serial.baudRate', this.state.connection.serial.baudRate);
      }
      // Hardware flow control
      this.config.set('connection.serial.rtscts', this.state.connection.serial.rtscts);
    }

    {
      // Socket connection
      if (this.state.connection.socket.host !== prevState.connection.socket.host) {
        this.config.set('connection.socket.host', this.state.connection.socket.host);
      }
      if (this.state.connection.socket.port !== prevState.connection.socket.port) {
        this.config.set('connection.socket.port', this.state.connection.socket.port);
      }
    }

    this.config.set('autoReconnect', this.state.autoReconnect);
  }

  addControllerEvents() {
    Object.keys(this.controllerEvents).forEach(eventName => {
      const callback = this.controllerEvents[eventName];

      controller.addListener(eventName, callback);
    });
  }

  removeControllerEvents() {
    Object.keys(this.controllerEvents).forEach(eventName => {
      const callback = this.controllerEvents[eventName];

      controller.removeListener(eventName, callback);
    });
  }

  async refresh(options) {
    const {autoConnect = false} = {...options};

    let loadingTimeout = null;

    // Start loading
    this.setState({
      loading: true,
    });

    // Cancel loading after 5 seconds
    loadingTimeout = setTimeout(() => {
      loadingTimeout = null;

      this.setState({
        loading: false,
      });
    }, 5000);

    const fetchBaudRates = promisify(controller.getBaudRates, {
      errorFirst: true,
      thisArg: controller,
    });

    const fetchPorts = promisify(controller.getPorts, {
      errorFirst: true,
      thisArg: controller,
    });

    try {
      const baudRates = await fetchBaudRates();
      log.debug('Received a list of supported baud rates:', baudRates);
      this.setState(state => ({
        baudRates: reverse(sortBy(uniq(baudRates.concat(state.baudRates)))),
      }));

      const ports = await fetchPorts();
      log.debug('Received a list of available serial ports:', ports);
      const path = this.config.get('connection.serial.path');
      if (includes(map(ports, 'comName'), path)) {
        this.setState(state => ({
          alertMessage: '',
          connection: {
            ...state.connection,
            serial: {
              ...state.connection.serial,
              path,
            },
          },
          ports,
        }));

        if (this.state.autoReconnect && autoConnect) {
          this.openPort(path);
        }
      } else {
        this.setState({
          alertMessage: '',
          ports,
        });
      }
    } catch (err) {
      log.error(err);
    }

    // Stop loading
    if (loadingTimeout) {
      clearTimeout(loadingTimeout);
      loadingTimeout = null;
    }
    this.setState({
      loading: false,
    });
  }

  openPort(path, baudRate) {
    const controllerType = this.state.controller.type;
    const connectionType = this.state.connection.type;
    const options = {
      baudRate: baudRate || this.state.connection.serial.baudRate,
      path: path || this.state.connection.serial.path,
      rtscts: this.state.connection.serial.rtscts,
    };

    this.setState({
      connecting: true,
    });

    controller.open(controllerType, connectionType, options, err => {
      if (err) {
        log.error(err);
        this.setState({
          alertMessage: i18n._('Error opening serial port: {{-path}}', {path: options.path}),
          connected: false,
          connecting: false,
        });
        return;
      }
    });
  }

  closePort() {
    this.setState({
      connected: false,
      connecting: false,
    });

    controller.close(err => {
      if (err) {
        log.error(err);
        return;
      }

      this.refresh();
    });
  }
}

export default ConnectionWidget;
