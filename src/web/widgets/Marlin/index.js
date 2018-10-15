import classcat from 'classcat';
import controller from '../../lib/controller';
import ensurePositiveNumber from '../../lib/ensure-positive-number';
import i18n from '../../lib/i18n';
import isNumber from 'lodash/isNumber';
import PropTypes from 'prop-types';
import React, {PureComponent} from 'react';

import {MARLIN} from '../../constants';
import {MODAL_NONE, MODAL_CONTROLLER} from './constants';

import Controller from './Controller';
import Marlin from './Marlin';
import Widget from '../../components/Widget';
import WidgetConfig from '../WidgetConfig';

import styles from './index.styl';

class MarlinWidget extends PureComponent {
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
      minimized: this.config.get('minimized', false),
      isFullscreen: false,
      isReady: controller.availableControllers.length === 1 || controller.type === MARLIN,
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
        heaterControl: {
          expanded: this.config.get('panel.heaterControl.expanded'),
        },
        statusReports: {
          expanded: this.config.get('panel.statusReports.expanded'),
        },
        modalGroups: {
          expanded: this.config.get('panel.modalGroups.expanded'),
        },
      },
      heater: {
        extruder: this.config.get('heater.extruder', 0),
        heatedBed: this.config.get('heater.heatedBed', 0),
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

    if (state.controller.type !== MARLIN) {
      return null;
    }

    return (
      <Widget>
        <Widget.Header>
          <Widget.Title>Marlin</Widget.Title>
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
                <Widget.DropdownMenuItem onSelect={() => controller.writeln('M105')} disabled={!state.canClick}>
                  {i18n._('Get Extruder Temperature (M105)')}
                </Widget.DropdownMenuItem>
                <Widget.DropdownMenuItem onSelect={() => controller.writeln('M114')} disabled={!state.canClick}>
                  {i18n._('Get Current Position (M114)')}
                </Widget.DropdownMenuItem>
                <Widget.DropdownMenuItem onSelect={() => controller.writeln('M115')} disabled={!state.canClick}>
                  {i18n._('Get Firmware Version and Capabilities (M115)')}
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
          <Widget.Content className={classcat([styles['widget-content'], {[styles.hidden]: minimized}])}>
            {state.modal.name === MODAL_CONTROLLER && <Controller state={state} actions={actions} />}
            <Marlin state={state} actions={actions} />
          </Widget.Content>
        )}
      </Widget>
    );
  }

  actions = {
    toggleFullscreen: () => {
      const {minimized, isFullscreen} = this.state;

      this.setState({
        minimized: isFullscreen ? minimized : false,
      });
    },
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
    toggleHeaterControl: () => {
      const expanded = this.state.panel.heaterControl.expanded;

      this.setState({
        panel: {
          ...this.state.panel,
          heaterControl: {
            ...this.state.panel.heaterControl,
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
    changeExtruderTemperature: event => {
      const value = event.target.value;
      if (typeof value === 'string' && value.trim() === '') {
        this.setState(state => ({
          heater: {
            ...state.heater,
            extruder: value,
          },
        }));
      } else {
        this.setState(state => ({
          heater: {
            ...state.heater,
            extruder: ensurePositiveNumber(value),
          },
        }));
      }
    },
    changeHeatedBedTemperature: event => {
      const value = event.target.value;
      if (typeof value === 'string' && value.trim() === '') {
        this.setState(state => ({
          heater: {
            ...state.heater,
            heatedBed: value,
          },
        }));
      } else {
        this.setState(state => ({
          heater: {
            ...state.heater,
            heatedBed: ensurePositiveNumber(value),
          },
        }));
      }
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
        isReady: controller.type === MARLIN,
      }));
    },
    'connection:close': () => {
      const initialState = this.getInitialState();
      this.setState({...initialState});
    },
    'controller:settings': (type, controllerSettings) => {
      if (type === MARLIN) {
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
      if (type === MARLIN) {
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
    const {heater, minimized, panel} = this.state;

    this.config.set('minimized', minimized);
    this.config.set('panel.heaterControl.expanded', panel.heaterControl.expanded);
    this.config.set('panel.statusReports.expanded', panel.statusReports.expanded);
    this.config.set('panel.modalGroups.expanded', panel.modalGroups.expanded);
    if (isNumber(heater.extruder)) {
      this.config.set('heater.extruder', heater.extruder);
    }
    if (isNumber(heater.heatedBed)) {
      this.config.set('heater.heatedBed', heater.heatedBed);
    }
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
    if (controller.type !== MARLIN) {
      return false;
    }

    if (!controller.connection.ident) {
      return false;
    }

    return true;
  }
}

export default MarlinWidget;
