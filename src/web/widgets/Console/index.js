import classcat from 'classcat';
import color from 'cli-color';
import PropTypes from 'prop-types';
import pubsub from 'pubsub-js';
import React, {Fragment, PureComponent} from 'react';
import uuid from 'uuid';

import controller from '../../lib/controller';
import i18n from '../../lib/i18n';

import settings from '../../config/settings';

import Card, {CardHeader} from '../../components_new/Card';
import Console from './Console';
import Padding from '../../components_new/Padding';
import WidgetConfig from '../WidgetConfig';

const appName = settings.productName;
const appVersion = settings.version;

// The buffer starts with 254 bytes free. The terminating <LF> or <CR> counts as a byte.
const TERMINAL_COLS = 254;
const TERMINAL_ROWS = 15;

class ConsoleWidget extends PureComponent {
  static propTypes = {
    widgetId: PropTypes.string.isRequired,
  };

  senderId = uuid.v4();

  collapse = () => {
    this.setState({minimized: true});
  };

  expand = () => {
    this.setState({minimized: false});
  };

  config = new WidgetConfig(this.props.widgetId);

  state = this.getInitialState();

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

  render() {
    const {minimized} = this.state;

    const state = {...this.state};
    const actions = {...this.actions};

    return (
      <Card noPad shadow>
        <CardHeader>
          {minimized ? null : (
            <Fragment>
              <div className="right" title={i18n._('Clear Selection')} onClick={() => this.terminal.selectAll()}>
                <i className="icon select-all" />
              </div>
              <div className="right" title={i18n._('Select All')} onClick={() => this.terminal.clearSelection()}>
                <i className="fa fa-fw fa-window-close-o" />
              </div>
              <div className="right" title={i18n._('Clear all')} onClick={actions.clearAll}>
                <i className="fa fa-trash" />
              </div>
            </Fragment>
          )}
          <h3 onMouseDown={actions.toggleMinimized}>{i18n._('Console')}</h3>
        </CardHeader>
        <div className={classcat([{hidden: minimized}])}>
          <Padding size="small">
            <Console
              ref={node => {
                if (node) {
                  this.terminal = node.terminal;
                }
              }}
              state={state}
              actions={actions}
            />
          </Padding>
        </div>
      </Card>
    );
  }

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
    'connection:close': () => {
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
              host,
              port,
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
      let localData = data;
      const {source, __sender__} = {...context};

      if (__sender__ === this.senderId) {
        // Do not write to the terminal console if the sender is the widget itself
        return;
      }

      if (!this.terminal) {
        return;
      }

      localData = String(localData).trim();

      if (source) {
        this.terminal.writeln(color.blackBright(source) + color.white(this.terminal.prompt + localData));
      } else {
        this.terminal.writeln(color.white(this.terminal.prompt + localData));
      }
    },
  };

  terminal = null;

  pubsubTokens = [];

  componentDidMount() {
    this.addControllerEvents();
    this.subscribe();
  }

  componentWillUnmount() {
    this.removeControllerEvents();
    this.unsubscribe();
  }

  componentDidUpdate() {
    const {minimized} = this.state;

    this.config.set('minimized', minimized);
  }

  subscribe() {
    const tokens = [
      pubsub.subscribe('resize', () => {
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
