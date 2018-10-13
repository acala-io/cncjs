import classcat from 'classcat';
import color from 'cli-color';
import PropTypes from 'prop-types';
import pubsub from 'pubsub-js';
import React, {PureComponent} from 'react';
import uuid from 'uuid';

import controller from '../../lib/controller';
import i18n from '../../lib/i18n';

import settings from '../../config/settings';

import Console from './Console';
import Space from '../../components/Space';
import Widget from '../../components/Widget';
import WidgetConfig from '../WidgetConfig';

import styles from './index.styl';

const appName = settings.productName;
const appVersion = settings.version;

// The buffer starts with 254 bytes free. The terminating <LF> or <CR> counts as a byte.
const TERMINAL_COLS = 254;
const TERMINAL_ROWS = 15;

class ConsoleWidget extends PureComponent {
  static propTypes = {
    sortable: PropTypes.object,
    widgetId: PropTypes.string.isRequired,
  };

  senderId = uuid.v4();

  // Public methods
  collapse = () => {
    this.setState({minimized: true});
  };

  expand = () => {
    this.setState({minimized: false});
  };

  config = new WidgetConfig(this.props.widgetId);

  state = this.getInitialState();

  actions = {
    clearAll: () => {
      if (this.terminal) {
        this.terminal.clear();
      }
    },
    onTerminalData: data => {
      const context = {
        __sender__: this.senderId,
      };
      controller.write(data, context);
    },
    toggleFullscreen: () => {
      this.setState(
        state => ({
          isFullscreen: !state.isFullscreen,
          minimized: state.isFullscreen ? state.minimized : false,
          terminal: {
            ...state.terminal,
            rows: state.isFullscreen ? TERMINAL_ROWS : 'auto',
          },
        }),
        () => {
          this.resizeTerminal();
        }
      );
    },
    toggleMinimized: () => {
      this.setState(
        state => ({
          minimized: !state.minimized,
        }),
        () => {
          this.resizeTerminal();
        }
      );
    },
  };

  controllerEvents = {
    'connection:close': options => {
      const initialState = this.getInitialState();

      this.setState({...initialState});
      this.actions.clearAll();
    },
    'connection:open': options => {
      const {ident} = options;
      this.setState(state => ({
        connection: {
          ...state.connection,
          ident,
        },
      }));

      if (!this.terminal) {
        return;
      }

      this.terminal.writeln(color.white.bold(`${appName} ${appVersion} [${controller.type}]`));

      const {settings, type} = options;

      if (type === 'serial') {
        const {path, baudRate} = {...settings};

        this.terminal.writeln(
          color.white(
            i18n._('Connected to {{-path}} with a baud rate of {{baudRate}}', {
              baudRate: color.blueBright(baudRate),
              path: color.yellowBright(path),
            })
          )
        );
      } else if (type === 'socket') {
        const {host, port} = {...settings};

        this.terminal.writeln(
          color.white(
            i18n._('Connected to {{host}}:{{port}}', {
              host: host,
              port: port,
            })
          )
        );
      }
    },
    'connection:read': (options, data) => {
      if (!this.terminal) {
        return;
      }

      this.terminal.writeln(data);
    },
    'connection:write': (options, data, context) => {
      const {source, __sender__} = {...context};

      if (__sender__ === this.senderId) {
        // Do not write to the terminal console if the sender is the widget itself
        return;
      }

      if (!this.terminal) {
        return;
      }

      data = String(data).trim();

      if (source) {
        this.terminal.writeln(color.blackBright(source) + color.white(this.terminal.prompt + data));
      } else {
        this.terminal.writeln(color.white(this.terminal.prompt + data));
      }
    },
  };
  terminal = null;
  pubsubTokens = [];

  render() {
    const {widgetId} = this.props;
    const {isFullscreen, minimized} = this.state;
    const state = {...this.state};
    const actions = {...this.actions};

    return (
      <Widget fullscreen={isFullscreen}>
        <Widget.Header>
          <Widget.Title>{i18n._('Console')}</Widget.Title>
          <Widget.Controls className={this.props.sortable.filterClassName}>
            <Widget.Button title={i18n._('Clear Selection')} onClick={() => this.terminal.selectAll()}>
              <i className={classcat([styles.icon, styles.selectAll])} />
            </Widget.Button>
            <Widget.Button title={i18n._('Select All')} onClick={() => this.terminal.clearSelection()}>
              <i className="fa fa-fw fa-window-close-o" />
            </Widget.Button>
            <Widget.Button title={i18n._('Clear all')} onClick={actions.clearAll}>
              <i className="fa fa-trash" />
            </Widget.Button>
            <Widget.Button
              disabled={isFullscreen}
              title={minimized ? i18n._('Expand') : i18n._('Collapse')}
              onClick={actions.toggleMinimized}
            >
              <i className={classcat(['fa', {'fa-chevron-up': !minimized}, {'fa-chevron-down': minimized}])} />
            </Widget.Button>
            <Widget.Button
              title={!isFullscreen ? i18n._('Enter Full Screen') : i18n._('Exit Full Screen')}
              onClick={actions.toggleFullscreen}
            >
              <i className={classcat(['fa', {'fa-expand': !isFullscreen}, {'fa-compress': isFullscreen}])} />
            </Widget.Button>
          </Widget.Controls>
        </Widget.Header>
        <Widget.Content
          className={classcat([
            styles.widgetContent,
            {[styles.hidden]: minimized},
            {[styles.fullscreen]: isFullscreen},
          ])}
        >
          <Console
            ref={node => {
              if (node) {
                this.terminal = node.terminal;
              }
            }}
            state={state}
            actions={actions}
          />
        </Widget.Content>
      </Widget>
    );
  }

  componentDidMount() {
    this.addControllerEvents();
    this.subscribe();
  }

  componentWillUnmount() {
    this.removeControllerEvents();
    this.unsubscribe();
  }

  componentDidUpdate(prevProps, prevState) {
    const {minimized} = this.state;

    this.config.set('minimized', minimized);
  }

  getInitialState() {
    return {
      connection: {
        ident: controller.connection.ident,
      },
      isFullscreen: false,
      minimized: this.config.get('minimized', false),

      // Terminal
      terminal: {
        cols: TERMINAL_COLS,
        cursorBlink: true,
        rows: TERMINAL_ROWS,
        scrollback: 1000,
        tabStopWidth: 4,
      },
    };
  }

  subscribe() {
    const tokens = [
      pubsub.subscribe('resize', msg => {
        this.resizeTerminal();
      }),
    ];
    this.pubsubTokens = this.pubsubTokens.concat(tokens);
  }

  unsubscribe() {
    this.pubsubTokens.forEach(token => {
      pubsub.unsubscribe(token);
    });
    this.pubsubTokens = [];
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

  resizeTerminal() {
    if (this.terminal) {
      this.terminal.resize();
    }
  }
}

export default ConsoleWidget;
