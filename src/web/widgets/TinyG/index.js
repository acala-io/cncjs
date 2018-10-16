import classcat from 'classcat';
import PropTypes from 'prop-types';
import React, {PureComponent} from 'react';

import controller from '../../lib/controller';
import i18n from '../../lib/i18n';

import {MODAL_NONE, MODAL_CONTROLLER} from './constants';
import {TINYG} from '../../constants';

import Controller from './Controller';
import TinyG from './TinyG';
import Widget from '../../components/Widget';
import WidgetConfig from '../WidgetConfig';

import './index.scss';

class TinyGWidget extends PureComponent {
  static propTypes = {
    widgetId: PropTypes.string.isRequired,
  };

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
      isReady: controller.availableControllers.length === 1 || controller.type === TINYG,
      canClick: false,
      controller: {
        type: controller.type,
        settings: controller.settings,
        state: controller.state,
      },
      connection: {
        ident: controller.connection.ident,
      },
      modal: {
        name: MODAL_NONE,
        params: {},
      },
      panel: {
        powerManagement: {
          expanded: this.config.get('panel.powerManagement.expanded'),
        },
        queueReports: {
          expanded: this.config.get('panel.queueReports.expanded'),
        },
        statusReports: {
          expanded: this.config.get('panel.statusReports.expanded'),
        },
        modalGroups: {
          expanded: this.config.get('panel.modalGroups.expanded'),
        },
      },
    };
  }

  render() {
    const {isFullscreen, isReady, minimized} = this.state;

    const state = {
      ...this.state,
      canClick: this.canClick(),
    };
    const actions = {
      ...this.actions,
    };

    if (state.controller.type !== TINYG) {
      return null;
    }

    return (
      <Widget>
        <Widget.Header>
          <Widget.Title>TinyG</Widget.Title>
          <Widget.Controls>
            {isReady && (
              <Widget.Button
                onClick={() => {
                  actions.openModal(MODAL_CONTROLLER);
                }}
              >
                <i className="fa fa-info" />
              </Widget.Button>
            )}
            {isReady && (
              <Widget.DropdownButton toggle={<i className="fa fa-th-large" />}>
                <Widget.DropdownMenuItem onSelect={() => controller.writeln('?')} disabled={!state.canClick}>
                  {i18n._('Status Report (?)')}
                </Widget.DropdownMenuItem>
                <Widget.DropdownMenuItem
                  onSelect={() => {
                    controller.writeln('!%'); // queue flush
                    controller.writeln('{"qr":""}'); // queue report
                  }}
                  disabled={!state.canClick}
                >
                  {i18n._('Queue Flush (%)')}
                </Widget.DropdownMenuItem>
                <Widget.DropdownMenuItem onSelect={() => controller.write('\x04')} disabled={!state.canClick}>
                  {i18n._('Kill Job (^d)')}
                </Widget.DropdownMenuItem>
                <Widget.DropdownMenuItem onSelect={() => controller.command('unlock')} disabled={!state.canClick}>
                  {i18n._('Clear Alarm ($clear)')}
                </Widget.DropdownMenuItem>
                <Widget.DropdownMenuItem divider />
                <Widget.DropdownMenuItem onSelect={() => controller.writeln('h')} disabled={!state.canClick}>
                  {i18n._('Help')}
                </Widget.DropdownMenuItem>
                <Widget.DropdownMenuItem onSelect={() => controller.writeln('$sys')} disabled={!state.canClick}>
                  {i18n._('Show System Settings')}
                </Widget.DropdownMenuItem>
                <Widget.DropdownMenuItem onSelect={() => controller.writeln('$$')} disabled={!state.canClick}>
                  {i18n._('Show All Settings')}
                </Widget.DropdownMenuItem>
                <Widget.DropdownMenuItem onSelect={() => controller.writeln('$test')} disabled={!state.canClick}>
                  {i18n._('List Self Tests')}
                </Widget.DropdownMenuItem>
                <Widget.DropdownMenuItem divider />
                <Widget.DropdownMenuItem onSelect={() => controller.writeln('$defa=1')} disabled={!state.canClick}>
                  {i18n._('Restore Defaults')}
                </Widget.DropdownMenuItem>
              </Widget.DropdownButton>
            )}
            {isReady && (
              <Widget.Button
                disabled={isFullscreen}
                title={minimized ? i18n._('Expand') : i18n._('Collapse')}
                onClick={actions.toggleMinimized}
              >
                <i className={classcat(['fa', {'fa-chevron-up': !minimized}, {'fa-chevron-down': minimized}])} />
              </Widget.Button>
            )}
          </Widget.Controls>
        </Widget.Header>
        {isReady && (
          <Widget.Content className={classcat(['widget-content', {hidden: minimized}])}>
            {state.modal.name === MODAL_CONTROLLER && <Controller state={state} actions={actions} />}
            <TinyG state={state} actions={actions} />
          </Widget.Content>
        )}
      </Widget>
    );
  }

  actions = {
    openModal: (name = MODAL_NONE, params = {}) => {
      this.setState({
        modal: {
          name,
          params,
        },
      });
    },
    closeModal: () => {
      this.setState({
        modal: {
          name: MODAL_NONE,
          params: {},
        },
      });
    },
    updateModalParams: (params = {}) => {
      this.setState({
        modal: {
          ...this.state.modal,
          params: {
            ...this.state.modal.params,
            ...params,
          },
        },
      });
    },
    togglePowerManagement: () => {
      const expanded = this.state.panel.powerManagement.expanded;

      this.setState({
        panel: {
          ...this.state.panel,
          powerManagement: {
            ...this.state.panel.powerManagement,
            expanded: !expanded,
          },
        },
      });
    },
    toggleQueueReports: () => {
      const expanded = this.state.panel.queueReports.expanded;

      this.setState({
        panel: {
          ...this.state.panel,
          queueReports: {
            ...this.state.panel.queueReports,
            expanded: !expanded,
          },
        },
      });
    },
    toggleStatusReports: () => {
      const expanded = this.state.panel.statusReports.expanded;

      this.setState({
        panel: {
          ...this.state.panel,
          statusReports: {
            ...this.state.panel.statusReports,
            expanded: !expanded,
          },
        },
      });
    },
    toggleModalGroups: () => {
      const expanded = this.state.panel.modalGroups.expanded;

      this.setState({
        panel: {
          ...this.state.panel,
          modalGroups: {
            ...this.state.panel.modalGroups,
            expanded: !expanded,
          },
        },
      });
    },
  };
  controllerEvents = {
    'connection:open': options => {
      const {ident} = options;
      this.setState(state => ({
        connection: {
          ...state.connection,
          ident,
        },
        isReady: controller.type === TINYG,
      }));
    },
    'connection:close': () => {
      const initialState = this.getInitialState();
      this.setState({...initialState});
    },
    'controller:settings': (type, controllerSettings) => {
      if (type === TINYG) {
        this.setState(state => ({
          controller: {
            ...state.controller,
            settings: controllerSettings,
            type,
          },
        }));
      }
    },
    'controller:state': (type, controllerState) => {
      if (type === TINYG) {
        this.setState(state => ({
          controller: {
            ...state.controller,
            state: controllerState,
            type,
          },
        }));
      }
    },
  };

  componentDidMount() {
    this.addControllerEvents();
  }

  componentWillUnmount() {
    this.removeControllerEvents();
  }

  componentDidUpdate() {
    const {minimized, panel} = this.state;

    this.config.set('minimized', minimized);
    this.config.set('panel.powerManagement.expanded', panel.powerManagement.expanded);
    this.config.set('panel.queueReports.expanded', panel.queueReports.expanded);
    this.config.set('panel.statusReports.expanded', panel.statusReports.expanded);
    this.config.set('panel.modalGroups.expanded', panel.modalGroups.expanded);
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

  canClick() {
    if (controller.type !== TINYG) {
      return false;
    }

    if (!controller.connection.ident) {
      return false;
    }

    return true;
  }
}

export default TinyGWidget;
