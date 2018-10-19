import ensureArray from 'ensure-array';
import PropTypes from 'prop-types';
import React, {Fragment, PureComponent} from 'react';
import {get, includes, map, mapValues} from 'lodash';

import combokeys from '../../lib/combokeys';
import controller from '../../lib/controller';
import i18n from '../../lib/i18n';
import {in2mm, mapPositionToUnits} from '../../lib/units';
import {limit} from '../../lib/normalize-range';
import {preventDefault} from '../../lib/dom-events';

import API from '../../api';

import {
  // Units
  IMPERIAL_UNITS,
  IMPERIAL_STEPS,
  METRIC_UNITS,
  METRIC_STEPS,
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
import {MODAL_NONE, MODAL_SETTINGS, DEFAULT_AXES} from './constants';

import Axes from './Axes';
import Card from '../../components_new/Card';
import KeypadOverlay from './KeypadOverlay';
import Padding from '../../components_new/Padding';
import Settings from './Settings';
import ShuttleControl from './ShuttleControl';
import WidgetConfig from '../../widgets/WidgetConfig';

const getControllerState = (type, controllerState, state) => {
  const {machinePosition, workPosition} = state;
  const {modal = {}} = {...controllerState};

  const units =
    {
      G20: IMPERIAL_UNITS,
      G21: METRIC_UNITS,
    }[modal.units] || state.units;

  const controller = {
    ...state.controller,
    state: controllerState,
    type,
  };

  const commonState = {
    controller,
    units,
  };

  // GRBL
  // Machine position and work position are reported in mm ($13=0) or inches ($13=1)
  if (type === GRBL) {
    const {mpos, wpos} = {...controllerState};
    const $13 = Number(get(controller.settings, 'settings.$13', 0)) || 0;
    const mapPositionGRBL = val => ($13 > 0 ? in2mm(val) : val);

    return {
      ...commonState,
      machinePosition: mapValues({...machinePosition, ...mpos}, mapPositionGRBL),
      workPosition: mapValues({...workPosition, ...wpos}, mapPositionGRBL),
    };
  }

  // Marlin
  // Machine position and work position are reported in current units
  if (type === MARLIN) {
    const {pos} = {...controllerState};
    const mapPositionMARLIN = val => (units === IMPERIAL_UNITS ? in2mm(val) : val);

    return {
      ...commonState,
      machinePosition: mapValues({...machinePosition, ...pos}, mapPositionMARLIN),
      workPosition: mapValues({...workPosition, ...pos}, mapPositionMARLIN),
    };
  }

  // Smoothie
  // Machine position and work position are reported in current units
  if (type === SMOOTHIE) {
    const {mpos, wpos} = {...controllerState};
    const mapPositionSMOOTHIE = val => (units === IMPERIAL_UNITS ? in2mm(val) : val);

    return {
      commonState,
      machinePosition: mapValues({...machinePosition, ...mpos}, mapPositionSMOOTHIE),
      workPosition: mapValues({...workPosition, ...wpos}, mapPositionSMOOTHIE),
    };
  }

  // TinyG
  // https://github.com/synthetos/g2/wiki/Status-Reports
  // Canonical machine position is always reported in millimeters with no offsets.
  // Work position is reported in current units, and also applies any offsets.
  if (type === TINYG) {
    const {mpos, wpos} = {...controllerState};
    const mapPositionTINYG = val => (units === IMPERIAL_UNITS ? in2mm(val) : val);

    return {
      commonState,
      machinePosition: {...machinePosition, ...mpos},
      workPosition: mapValues({...workPosition, ...wpos}, mapPositionTINYG),
    };
  }

  return {};
};

class AxesWidget extends PureComponent {
  static propTypes = {
    widgetId: PropTypes.string.isRequired,
  };

  config = new WidgetConfig(this.props.widgetId);

  state = this.getInitialState();

  getInitialState() {
    const {settings, state, type} = controller;

    return {
      axes: this.config.get('axes', DEFAULT_AXES),
      canClick: false,
      connection: {
        ident: controller.connection.ident,
      },
      controller: {
        settings,
        state,
        type,
      },
      jog: {
        axis: '', // Defaults to empty
        imperial: {
          distances: ensureArray(this.config.get('jog.imperial.distances', [])),
          step: this.config.get('jog.imperial.step'),
        },
        keypad: this.config.get('jog.keypad'),
        metric: {
          distances: ensureArray(this.config.get('jog.metric.distances', [])),
          step: this.config.get('jog.metric.step'),
        },
      },
      machinePosition: {
        // Machine position
        x: '0.000',
        y: '0.000',
        z: '0.000',
        a: '0.000',
        b: '0.000',
        c: '0.000',
      },
      mdi: {
        commands: [],
        disabled: this.config.get('mdi.disabled'),
      },
      modal: {
        name: MODAL_NONE,
        params: {},
      },
      units: METRIC_UNITS,
      workflow: {
        state: controller.workflow.state,
      },
      workPosition: {
        // Work position
        x: '0.000',
        y: '0.000',
        z: '0.000',
        a: '0.000',
        b: '0.000',
        c: '0.000',
      },
    };
  }

  render() {
    const {machinePosition, units, workPosition} = this.state;
    const config = this.config;

    const state = {
      ...this.state,
      // Determine if the motion button is clickable
      canClick: this.canClick(),
      // Output machine position with the display units
      machinePosition: mapValues(machinePosition, pos => String(mapPositionToUnits(pos, units))),
      // Output work position with the display units
      workPosition: mapValues(workPosition, pos => String(mapPositionToUnits(pos, units))),
    };

    const actions = {...this.actions};

    return (
      <Card noPad shadow>
        <Axes config={config} state={state} actions={actions} />
        <Padding size="small">
          {this.widgetControls}
          {this.modalHasToBeMovedToGlobalModals}
        </Padding>
      </Card>
    );
  }

  actions = {
    closeModal: () => {
      this.setState({
        modal: {
          name: MODAL_NONE,
          params: {},
        },
      });
    },
    openModal: (name = MODAL_NONE, params = {}) => {
      this.setState({
        modal: {
          name,
          params,
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
    getJogDistance: () => {
      const {units} = this.state;

      if (units === IMPERIAL_UNITS) {
        const step = this.config.get('jog.imperial.step');
        const imperialJogDistances = ensureArray(this.config.get('jog.imperial.distances', []));
        const imperialJogSteps = [...imperialJogDistances, ...IMPERIAL_STEPS];
        const distance = Number(imperialJogSteps[step]) || 0;

        return distance;
      }

      if (units === METRIC_UNITS) {
        const step = this.config.get('jog.metric.step');
        const metricJogDistances = ensureArray(this.config.get('jog.metric.distances', []));
        const metricJogSteps = [...metricJogDistances, ...METRIC_STEPS];
        const distance = Number(metricJogSteps[step]) || 0;

        return distance;
      }

      return 0;
    },
    setWorkOffsets: (axis, value) => {
      let localAxis = axis;
      let localValue = value;
      const {wcs} = controller.getModalState();
      const p =
        {
          G54: 1,
          G55: 2,
          G56: 3,
          G57: 4,
          G58: 5,
          G59: 6,
        }[wcs] || 0;
      localAxis = (localAxis || '').toUpperCase();
      localValue = Number(localValue) || 0;

      const gcode = `G10 L20 P${p} ${localAxis}${localValue}`;
      controller.command('gcode', gcode);
    },
    jog: (params = {}) => {
      const s = map(params, (value, letter) => `${String(letter.toUpperCase())}${value}`).join(' ');
      controller.command('gcode', 'G91'); // relative
      controller.command('gcode', `G0 ${s}`);
      controller.command('gcode', 'G90'); // absolute
    },
    move: (params = {}) => {
      const s = map(params, (value, letter) => `${String(letter.toUpperCase())}${value}`).join(' ');
      controller.command('gcode', `G0 ${s}`);
    },
    toggleMDIMode: () => {
      this.setState(state => ({
        mdi: {
          ...state.mdi,
          disabled: !state.mdi.disabled,
        },
      }));
    },
    toggleKeypadJogging: () => {
      this.setState(state => ({
        jog: {
          ...state.jog,
          keypad: !state.jog.keypad,
        },
      }));
    },
    selectAxis: (axis = '') => {
      this.setState(state => ({
        jog: {
          ...state.jog,
          axis,
        },
      }));
    },
    selectStep: (value = '') => {
      const step = Number(value);

      this.setState(state => ({
        jog: {
          ...state.jog,
          imperial: {
            ...state.jog.imperial,
            step: state.units === IMPERIAL_UNITS ? step : state.jog.imperial.step,
          },
          metric: {
            ...state.jog.metric,
            step: state.units === METRIC_UNITS ? step : state.jog.metric.step,
          },
        },
      }));
    },
    stepForward: () => {
      this.setState(state => {
        const imperialJogSteps = [...state.jog.imperial.distances, ...IMPERIAL_STEPS];
        const metricJogSteps = [...state.jog.metric.distances, ...METRIC_STEPS];

        return {
          jog: {
            ...state.jog,
            imperial: {
              ...state.jog.imperial,
              step:
                state.units === IMPERIAL_UNITS
                  ? limit(state.jog.imperial.step + 1, 0, imperialJogSteps.length - 1)
                  : state.jog.imperial.step,
            },
            metric: {
              ...state.jog.metric,
              step:
                state.units === METRIC_UNITS
                  ? limit(state.jog.metric.step + 1, 0, metricJogSteps.length - 1)
                  : state.jog.metric.step,
            },
          },
        };
      });
    },
    stepBackward: () => {
      this.setState(state => {
        const imperialJogSteps = [...state.jog.imperial.distances, ...IMPERIAL_STEPS];
        const metricJogSteps = [...state.jog.metric.distances, ...METRIC_STEPS];

        return {
          jog: {
            ...state.jog,
            imperial: {
              ...state.jog.imperial,
              step:
                state.units === IMPERIAL_UNITS
                  ? limit(state.jog.imperial.step - 1, 0, imperialJogSteps.length - 1)
                  : state.jog.imperial.step,
            },
            metric: {
              ...state.jog.metric,
              step:
                state.units === METRIC_UNITS
                  ? limit(state.jog.metric.step - 1, 0, metricJogSteps.length - 1)
                  : state.jog.metric.step,
            },
          },
        };
      });
    },
    stepNext: () => {
      this.setState(state => {
        const imperialJogSteps = [...state.jog.imperial.distances, ...IMPERIAL_STEPS];
        const metricJogSteps = [...state.jog.metric.distances, ...METRIC_STEPS];

        return {
          jog: {
            ...state.jog,
            imperial: {
              ...state.jog.imperial,
              step:
                state.units === IMPERIAL_UNITS
                  ? (state.jog.imperial.step + 1) % imperialJogSteps.length
                  : state.jog.imperial.step,
            },
            metric: {
              ...state.jog.metric,
              step:
                state.units === METRIC_UNITS
                  ? (state.jog.metric.step + 1) % metricJogSteps.length
                  : state.jog.metric.step,
            },
          },
        };
      });
    },
    saveAxesSettings: () => {
      const axes = this.config.get('axes', DEFAULT_AXES);
      const imperialJogDistances = ensureArray(this.config.get('jog.imperial.distances', []));
      const metricJogDistances = ensureArray(this.config.get('jog.metric.distances', []));

      this.setState({
        axes,
        jog: {
          ...this.state.jog,
          imperial: {
            ...this.state.jog.imperial,
            distances: imperialJogDistances,
          },
          metric: {
            ...this.state.jog.metric,
            distances: metricJogDistances,
          },
        },
        modal: {
          name: MODAL_NONE,
          params: {},
        },
      });
    },
  };

  shuttleControlEvents = {
    SELECT_AXIS: (event, {axis}) => {
      const {canClick, jog} = this.state;

      if (!canClick) {
        return;
      }

      if (jog.axis === axis) {
        this.actions.selectAxis(); // deselect axis
      } else {
        this.actions.selectAxis(axis);
      }
    },
    JOG: (event, {axis = null, direction = 1, factor = 1}) => {
      const {canClick, jog} = this.state;

      if (!canClick) {
        return;
      }

      if (axis !== null && !jog.keypad) {
        // keypad jogging is disabled
        return;
      }

      // The keyboard events of arrow keys for X-axis/Y-axis and pageup/pagedown for Z-axis
      // are not prevented by default. If a jog command will be executed, it needs to
      // stop the default behavior of a keyboard combination in a browser.
      preventDefault(event);

      const localAxis = axis || jog.axis;
      const distance = this.actions.getJogDistance();
      const jogAxis = {
        x: () => this.actions.jog({X: direction * distance * factor}),
        y: () => this.actions.jog({Y: direction * distance * factor}),
        z: () => this.actions.jog({Z: direction * distance * factor}),
        a: () => this.actions.jog({A: direction * distance * factor}),
        b: () => this.actions.jog({B: direction * distance * factor}),
        c: () => this.actions.jog({C: direction * distance * factor}),
      }[localAxis];

      if (jogAxis) {
        jogAxis();
      }
    },
    JOG_LEVER_SWITCH: (event, {key = ''}) => {
      if (key === '-') {
        this.actions.stepBackward();
      } else if (key === '+') {
        this.actions.stepForward();
      } else {
        this.actions.stepNext();
      }
    },
    SHUTTLE: (event, {zone = 0}) => {
      const {canClick, jog} = this.state;

      if (!canClick) {
        return;
      }

      if (zone === 0) {
        // Clear accumulated result
        this.shuttleControl.clear();

        if (jog.axis) {
          controller.command('gcode', 'G90');
        }
        return;
      }

      if (!jog.axis) {
        return;
      }

      const distance = Math.min(this.actions.getJogDistance(), 1);
      const feedrateMin = this.config.get('shuttle.feedrateMin');
      const feedrateMax = this.config.get('shuttle.feedrateMax');
      const hertz = this.config.get('shuttle.hertz');
      const overshoot = this.config.get('shuttle.overshoot');

      this.shuttleControl.accumulate(zone, {
        axis: jog.axis,
        distance,
        feedrateMax,
        feedrateMin,
        hertz,
        overshoot,
      });
    },
  };
  controllerEvents = {
    'config:change': () => {
      this.fetchMDICommands();
    },
    'connection:open': options => {
      this.setState(state => ({
        connection: {
          ...state.connection,
          ident: options.ident,
        },
      }));
    },
    'connection:close': () => {
      const initialState = this.getInitialState();

      this.setState(state => ({
        ...initialState,
        mdi: {
          ...initialState.mdi,
          commands: [...state.mdi.commands],
        },
      }));
    },
    'workflow:state': workflowState => {
      const canJog = workflowState !== WORKFLOW_STATE_RUNNING;

      // Disable keypad jogging and shuttle wheel when the workflow state is 'running'.
      // This prevents accidental movement while sending G-code commands.
      this.setState(state => ({
        jog: {
          ...state.jog,
          axis: canJog ? state.jog.axis : '',
          keypad: canJog ? state.jog.keypad : false,
        },
        workflow: {
          ...state.workflow,
          state: workflowState,
        },
      }));
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
      const newState = getControllerState(type, controllerState, this.state);

      this.setState(newState);
    },
  };
  shuttleControl = null;

  fetchMDICommands = async () => {
    try {
      const res = await API.mdi.fetch();
      const {records: commands} = res.body;

      this.setState(state => ({
        mdi: {
          ...state.mdi,
          commands,
        },
      }));
    } catch (err) {
      // Ignore error
    }
  };

  componentDidMount() {
    this.fetchMDICommands();
    this.addControllerEvents();
    this.addShuttleControlEvents();
  }

  componentWillUnmount() {
    this.removeControllerEvents();
    this.removeShuttleControlEvents();
  }

  componentDidUpdate() {
    const {axes, jog, mdi, minimized, units} = this.state;

    this.config.set('minimized', minimized);
    this.config.set('axes', axes);
    this.config.set('jog.keypad', jog.keypad);
    if (units === IMPERIAL_UNITS) {
      this.config.set('jog.imperial.step', Number(jog.imperial.step) || 0);
    } else {
      this.config.set('jog.metric.step', Number(jog.metric.step) || 0);
    }
    this.config.set('mdi.disabled', mdi.disabled);
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

  addShuttleControlEvents() {
    Object.keys(this.shuttleControlEvents).forEach(eventName => {
      const callback = this.shuttleControlEvents[eventName];
      combokeys.on(eventName, callback);
    });

    // Shuttle Zone
    this.shuttleControl = new ShuttleControl();
    this.shuttleControl.on('flush', ({axis, feedrate, relativeDistance}) => {
      let localFeedrate = feedrate;
      let localRelativeDistance = relativeDistance;
      localFeedrate = Number(localFeedrate.toFixed(3));
      localRelativeDistance = Number(localRelativeDistance.toFixed(4));

      controller.command('gcode', 'G91'); // relative
      controller.command('gcode', `G1 F${localFeedrate} ${axis}${localRelativeDistance}`);
      controller.command('gcode', 'G90'); // absolute
    });
  }

  removeShuttleControlEvents() {
    Object.keys(this.shuttleControlEvents).forEach(eventName => {
      const callback = this.shuttleControlEvents[eventName];
      combokeys.removeListener(eventName, callback);
    });

    this.shuttleControl.removeAllListeners('flush');
    this.shuttleControl = null;
  }

  canClick() {
    const machineState = controller.getMachineState();

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

    return true;
  }

  get widgetControls() {
    const state = {
      ...this.state,
      // Determine if the motion button is clickable
      canClick: this.canClick(),
      // Output machine position with the display units
      machinePosition: mapValues(this.state.machinePosition, pos => String(mapPositionToUnits(pos, this.state.units))),
      // Output work position with the display units
      workPosition: mapValues(this.state.workPosition, pos => String(mapPositionToUnits(pos, this.state.units))),
    };
    const {canClick, jog} = state;
    const {openModal, toggleKeypadJogging, toggleMDIMode} = this.actions;

    return (
      <Fragment>
        <KeypadOverlay show={canClick && jog.keypad}>
          <div className="inline-block" title={i18n._('Keypad jogging')} onClick={toggleKeypadJogging}>
            <i className="fa fa-keyboard-o" />
          </div>
        </KeypadOverlay>
        <div className="inline-block" title={i18n._('Manual Data Input')} onClick={toggleMDIMode}>
          {i18n._('MDI')}
        </div>
        <div className="inline-block" title={i18n._('Settings')} onClick={() => openModal(MODAL_SETTINGS)}>
          <i className="fa fa-cog" />
        </div>
      </Fragment>
    );
  }

  get modalHasToBeMovedToGlobalModals() {
    if (!(this.state.modal.name === MODAL_SETTINGS)) {
      return null;
    }

    return <Settings config={this.config} onSave={this.actions.saveAxesSettings} onCancel={this.actions.closeModal} />;
  }
}

export default AxesWidget;
