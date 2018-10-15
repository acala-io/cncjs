import classcat from 'classcat';
import includes from 'lodash/includes';
import isNumber from 'lodash/isNumber';
import PropTypes from 'prop-types';
import React, {PureComponent} from 'react';

import controller from '../../lib/controller';
import ensurePositiveNumber from '../../lib/ensure-positive-number';
import i18n from '../../lib/i18n';

import {
  // Controller
  GRBL,
  GRBL_MACHINE_STATE_IDLE,
  GRBL_MACHINE_STATE_RUN,
  MARLIN,
  SMOOTHIE,
  SMOOTHIE_MACHINE_STATE_IDLE,
  SMOOTHIE_MACHINE_STATE_RUN,
  TINYG,
  TINYG_MACHINE_STATE_READY,
  TINYG_MACHINE_STATE_STOP,
  TINYG_MACHINE_STATE_END,
  TINYG_MACHINE_STATE_RUN,
  // Workflow
  WORKFLOW_STATE_RUNNING,
} from '../../constants';

import Laser from './Laser';
import Widget from '../../components/Widget';
import WidgetConfig from '../WidgetConfig';

import styles from './index.styl';

class LaserWidget extends PureComponent {
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
      isFullscreen: false,
      minimized: this.config.get('minimized', false),
      panel: {
        laserTest: {
          expanded: this.config.get('panel.laserTest.expanded'),
        },
      },
      test: {
        duration: this.config.get('test.duration', 0),
        maxS: this.config.get('test.maxS', 1000),
        power: this.config.get('test.power', 0),
      },
    };
  }

  render() {
    const {isFullscreen, minimized} = this.state;

    const state = {
      ...this.state,
      canClick: this.canClick(),
    };
    const actions = {
      ...this.actions,
    };

    return (
      <Widget fullscreen={isFullscreen}>
        <Widget.Header>
          <Widget.Title>{i18n._('Laser')}</Widget.Title>
          <Widget.Controls>
            <Widget.Button title={minimized ? i18n._('Expand') : i18n._('Collapse')} onClick={actions.toggleMinimized}>
              <i className={classcat(['fa', {'fa-chevron-up': !minimized}, {'fa-chevron-down': minimized}])} />
            </Widget.Button>
          </Widget.Controls>
        </Widget.Header>
        <Widget.Content className={classcat([styles.widgetContent, {[styles.hidden]: minimized}])}>
          <Laser state={state} actions={actions} />
        </Widget.Content>
      </Widget>
    );
  }

  actions = {
    toggleLaserTest: () => {
      const expanded = this.state.panel.laserTest.expanded;

      this.setState({
        panel: {
          ...this.state.panel,
          laserTest: {
            ...this.state.panel.laserTest,
            expanded: !expanded,
          },
        },
      });
    },
    changeLaserTestPower: value => {
      const power = Number(value) || 0;
      this.setState({
        test: {
          ...this.state.test,
          power,
        },
      });
    },
    changeLaserTestDuration: event => {
      const value = event.target.value;
      if (typeof value === 'string' && value.trim() === '') {
        this.setState({
          test: {
            ...this.state.test,
            duration: '',
          },
        });
      } else {
        this.setState({
          test: {
            ...this.state.test,
            duration: ensurePositiveNumber(value),
          },
        });
      }
    },
    changeLaserTestMaxS: event => {
      const value = event.target.value;
      if (typeof value === 'string' && value.trim() === '') {
        this.setState({
          test: {
            ...this.state.test,
            maxS: '',
          },
        });
      } else {
        this.setState({
          test: {
            ...this.state.test,
            maxS: ensurePositiveNumber(value),
          },
        });
      }
    },
    laserTestOn: () => {
      const {power, duration, maxS} = this.state.test;
      controller.command('lasertest', power, duration, maxS);
    },
    laserTestOff: () => {
      controller.command('lasertest', 0);
    },
    toggleMinimized: () => {
      const {minimized} = this.state;
      this.setState({minimized: !minimized});
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
      }));
    },
    'connection:close': () => {
      const initialState = this.getInitialState();
      this.setState({...initialState});
    },
    'controller:settings': (type, controllerSettings) => {
      this.setState(state => ({
        controller: {
          ...state.controller,
          settings: controllerSettings,
          type,
        },
      }));
    },
    'controller:state': (type, controllerState) => {
      this.setState(state => ({
        controller: {
          ...state.controller,
          state: controllerState,
          type,
        },
      }));
    },
  };

  componentDidMount() {
    this.addControllerEvents();
  }

  componentWillUnmount() {
    this.removeControllerEvents();
  }

  componentDidUpdate() {
    const {minimized, panel, test} = this.state;

    this.config.set('minimized', minimized);
    this.config.set('panel.laserTest.expanded', panel.laserTest.expanded);

    if (isNumber(test.power)) {
      this.config.set('test.power', test.power);
    }

    if (isNumber(test.duration)) {
      this.config.set('test.duration', test.duration);
    }

    if (isNumber(test.maxS)) {
      this.config.set('test.maxS', test.maxS);
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
    const machineState = controller.getMachineState();
    const state = this.state;

    if (!controller.connection.ident) {
      return false;
    }

    if (controller.type === GRBL && !includes([GRBL_MACHINE_STATE_IDLE, GRBL_MACHINE_STATE_RUN], machineState)) {
      return false;
    }

    if (controller.type === MARLIN) {
      // Marlin does not have machine state
    }

    if (
      controller.type === SMOOTHIE &&
      !includes([SMOOTHIE_MACHINE_STATE_IDLE, SMOOTHIE_MACHINE_STATE_RUN], machineState)
    ) {
      return false;
    }

    if (
      controller.type === TINYG &&
      !includes(
        [TINYG_MACHINE_STATE_READY, TINYG_MACHINE_STATE_STOP, TINYG_MACHINE_STATE_END, TINYG_MACHINE_STATE_RUN],
        machineState
      )
    ) {
      return false;
    }

    if (controller.workflow.state === WORKFLOW_STATE_RUNNING) {
      return false;
    }

    if (!(isNumber(state.test.power) && isNumber(state.test.duration) && isNumber(state.test.maxS))) {
      return false;
    }

    return true;
  }
}

export default LaserWidget;
