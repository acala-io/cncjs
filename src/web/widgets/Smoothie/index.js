import classcat from 'classcat';
import PropTypes from 'prop-types';
import React, {PureComponent} from 'react';

import controller from '../../lib/controller';
import i18n from '../../lib/i18n';

import {SMOOTHIE} from '../../constants';
import {MODAL_NONE, MODAL_CONTROLLER} from './constants';

import Controller from './Controller';
import Smoothie from './Smoothie';
import Widget from '../../components/Widget';
import WidgetConfig from '../WidgetConfig';

import './index.scss';

class SmoothieWidget extends PureComponent {
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
    const {settings, state, type} = controller;

    return {
      canClick: false,
      connection: {
        ident: controller.connection.ident,
      },
      controller: {
        settings,
        state,
        type,
      },
      isReady: controller.availableControllers.length === 1 || controller.type === SMOOTHIE,
      minimized: this.config.get('minimized', false),
      modal: {
        name: MODAL_NONE,
        params: {},
      },
      panel: {
        modalGroups: {
          expanded: this.config.get('panel.modalGroups.expanded'),
        },
        queueReports: {
          expanded: this.config.get('panel.queueReports.expanded'),
        },
        statusReports: {
          expanded: this.config.get('panel.statusReports.expanded'),
        },
      },
    };
  }

  render() {
    const {isReady, minimized} = this.state;

    const state = {
      ...this.state,
      canClick: this.canClick(),
    };

    const actions = {
      ...this.actions,
    };

    if (state.controller.type !== SMOOTHIE) {
      return null;
    }

    return (
      <Widget>
        <Widget.Header>
          <Widget.Title>Smoothie</Widget.Title>
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
                <Widget.DropdownMenuItem onSelect={() => controller.write('?')} disabled={!state.canClick}>
                  {i18n._('Status Report (?)')}
                </Widget.DropdownMenuItem>
                <Widget.DropdownMenuItem onSelect={() => controller.command('homing')} disabled={!state.canClick}>
                  {i18n._('Homing ($H)')}
                </Widget.DropdownMenuItem>
                <Widget.DropdownMenuItem onSelect={() => controller.command('unlock')} disabled={!state.canClick}>
                  {i18n._('Kill Alarm Lock ($X)')}
                </Widget.DropdownMenuItem>
                <Widget.DropdownMenuItem divider />
                <Widget.DropdownMenuItem onSelect={() => controller.writeln('help')} disabled={!state.canClick}>
                  {i18n._('Help')}
                </Widget.DropdownMenuItem>
                <Widget.DropdownMenuItem onSelect={() => controller.writeln('$#')} disabled={!state.canClick}>
                  {i18n._('View G-code Parameters ($#)')}
                </Widget.DropdownMenuItem>
                <Widget.DropdownMenuItem onSelect={() => controller.writeln('$G')} disabled={!state.canClick}>
                  {i18n._('View G-code Parser State ($G)')}
                </Widget.DropdownMenuItem>
              </Widget.DropdownButton>
            )}
            {isReady && (
              <Widget.Button
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
            <Smoothie state={state} actions={actions} />
          </Widget.Content>
        )}
      </Widget>
    );
  }

  actions = {
    toggleMinimized: () => {
      const {minimized} = this.state;
      this.setState({minimized: !minimized});
    },
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
        isReady: controller.type === SMOOTHIE,
      }));
    },
    'connection:close': () => {
      const initialState = this.getInitialState();
      this.setState({...initialState});
    },
    'controller:settings': (type, controllerSettings) => {
      if (type === SMOOTHIE) {
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
      if (type === SMOOTHIE) {
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
    if (controller.type !== SMOOTHIE) {
      return false;
    }

    if (!controller.connection.ident) {
      return false;
    }

    return true;
  }
}

export default SmoothieWidget;
