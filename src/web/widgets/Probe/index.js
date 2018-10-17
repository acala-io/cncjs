import classcat from 'classcat';
import PropTypes from 'prop-types';
import React, {PureComponent} from 'react';
import {includes, map} from 'lodash';

import controller from '../../lib/controller';
import i18n from '../../lib/i18n';
import {in2mm, mapValueToUnits} from '../../lib/units';

import {
  // Units
  IMPERIAL_UNITS,
  METRIC_UNITS,
  // Controller
  GRBL,
  GRBL_MACHINE_STATE_IDLE,
  MARLIN,
  SMOOTHIE,
  SMOOTHIE_MACHINE_STATE_IDLE,
  TINYG,
  TINYG_MACHINE_STATE_READY,
  TINYG_MACHINE_STATE_STOP,
  TINYG_MACHINE_STATE_END,
  // Workflow
  WORKFLOW_STATE_RUNNING,
} from '../../constants';
import {MODAL_NONE, MODAL_PREVIEW} from './constants';

import Card, {CardHeader} from '../../components_new/Card';
import Padding from '../../components_new/Padding';
import Probe from './Probe';
import WidgetConfig from '../WidgetConfig';
import ZProbe from './ZProbe';

import './index.scss';

const gcode = (cmd, params) => {
  const s = map(params, (value, letter) => String(letter + value)).join(' ');

  return s.length > 0 ? `${cmd} ${s}` : cmd;
};

class ProbeWidget extends PureComponent {
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
    const {state, type} = controller;

    return {
      canClick: false,
      connection: {
        ident: controller.connection.ident,
      },
      controller: {
        state,
        type,
      },
      minimized: this.config.get('minimized', false),
      modal: {
        name: MODAL_NONE,
        params: {},
      },
      probeCommand: this.config.get('probeCommand', 'G38.2'),
      probeDepth: Number(Number(this.config.get('probeDepth') || 0).toFixed(3)),
      probeFeedrate: Number(Number(this.config.get('probeFeedrate') || 0).toFixed(3)),
      retractionDistance: Number(Number(this.config.get('retractionDistance') || 0).toFixed(3)),
      touchPlateHeight: Number(Number(this.config.get('touchPlateHeight') || 0).toFixed(3)),
      units: METRIC_UNITS,
      useTLO: this.config.get('useTLO'),
      workflow: {
        state: controller.workflow.state,
      },
    };
  }

  render() {
    const {minimized} = this.state;

    const state = {
      ...this.state,
      canClick: this.canClick(),
    };

    const actions = {...this.actions};

    return (
      <Card noPad shadow>
        <CardHeader>
          <h2 onMouseDown={actions.toggleMinimized}>{i18n._('Probe')}</h2>
        </CardHeader>
        <div className={classcat([{hidden: minimized}])}>
          <Padding>
            <Probe state={state} actions={actions} />
            {state.modal.name === MODAL_PREVIEW && <ZProbe state={state} actions={actions} />}
          </Padding>
        </div>
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
    changeProbeCommand: value => {
      this.setState({probeCommand: value});
    },
    toggleUseTLO: () => {
      const {useTLO} = this.state;
      this.setState({useTLO: !useTLO});
    },
    handleProbeDepthChange: event => {
      const probeDepth = event.target.value;
      this.setState({probeDepth});
    },
    handleProbeFeedrateChange: event => {
      const probeFeedrate = event.target.value;
      this.setState({probeFeedrate});
    },
    handleTouchPlateHeightChange: event => {
      const touchPlateHeight = event.target.value;
      this.setState({touchPlateHeight});
    },
    handleRetractionDistanceChange: event => {
      const retractionDistance = event.target.value;
      this.setState({retractionDistance});
    },
    populateProbeCommands: () => {
      const {probeCommand, useTLO, probeDepth, probeFeedrate, touchPlateHeight, retractionDistance} = this.state;
      const {wcs} = controller.getModalState();
      const mapWCSToP = wcs =>
        ({
          G54: 1,
          G55: 2,
          G56: 3,
          G57: 4,
          G58: 5,
          G59: 6,
        }[wcs] || 0);
      const towardWorkpiece = includes(['G38.2', 'G38.3'], probeCommand);
      const tloProbeCommands = [
        gcode('; Cancel tool length offset'),
        // Cancel tool length offset
        gcode('G49'),

        // Z-Probe (use relative distance mode)
        gcode('; Z-Probe'),
        gcode('G91'),
        gcode(probeCommand, {
          F: probeFeedrate,
          Z: towardWorkpiece ? -probeDepth : probeDepth,
        }),
        // Use absolute distance mode
        gcode('G90'),

        // Dwell
        gcode('; A dwell time of one second'),
        gcode('G4 P1'),

        // Apply touch plate height with tool length offset
        gcode('; Set tool length offset'),
        gcode('G43.1', {
          Z: towardWorkpiece ? `[posz-${touchPlateHeight}]` : `[posz+${touchPlateHeight}]`,
        }),

        // Retract from the touch plate (use relative distance mode)
        gcode('; Retract from the touch plate'),
        gcode('G91'),
        gcode('G0', {
          Z: retractionDistance,
        }),
        // Use asolute distance mode
        gcode('G90'),
      ];
      const wcsProbeCommands = [
        // Z-Probe (use relative distance mode)
        gcode('; Z-Probe'),
        gcode('G91'),
        gcode(probeCommand, {
          F: probeFeedrate,
          Z: towardWorkpiece ? -probeDepth : probeDepth,
        }),
        // Use absolute distance mode
        gcode('G90'),

        // Set the WCS Z0
        gcode('; Set the active WCS Z0'),
        gcode('G10', {
          L: 20,
          P: mapWCSToP(wcs),
          Z: touchPlateHeight,
        }),

        // Retract from the touch plate (use relative distance mode)
        gcode('; Retract from the touch plate'),
        gcode('G91'),
        gcode('G0', {
          Z: retractionDistance,
        }),
        // Use absolute distance mode
        gcode('G90'),
      ];

      return useTLO ? tloProbeCommands : wcsProbeCommands;
    },
    runProbeCommands: commands => {
      controller.command('gcode', commands);
    },
    toggleMinimized: () => {
      const {minimized} = this.state;
      this.setState({minimized: !minimized});
    },
  };

  controllerEvents = {
    'connection:close': () => {
      const initialState = this.getInitialState();
      this.setState({...initialState});
    },
    'connection:open': options => {
      const {ident} = options;

      this.setState(state => ({
        connection: {
          ...state.connection,
          ident,
        },
      }));
    },
    'controller:state': (type, state) => {
      let units = this.state.units;

      // Grbl
      if (type === GRBL) {
        const {modal = {}} = {...state};
        units =
          {
            G20: IMPERIAL_UNITS,
            G21: METRIC_UNITS,
          }[modal.units] || units;
      }

      // Marlin
      if (type === MARLIN) {
        const {modal = {}} = {...state};
        units =
          {
            G20: IMPERIAL_UNITS,
            G21: METRIC_UNITS,
          }[modal.units] || units;
      }

      // Smoothie
      if (type === SMOOTHIE) {
        const {modal = {}} = {...state};
        units =
          {
            G20: IMPERIAL_UNITS,
            G21: METRIC_UNITS,
          }[modal.units] || units;
      }

      // TinyG
      if (type === TINYG) {
        const {modal = {}} = {...state};
        units =
          {
            G20: IMPERIAL_UNITS,
            G21: METRIC_UNITS,
          }[modal.units] || units;
      }

      if (this.state.units !== units) {
        // Set `this.unitsDidChange` to true if the unit has changed
        this.unitsDidChange = true;
      }

      this.setState({
        controller: {
          state,
          type,
        },
        probeDepth: mapValueToUnits(this.config.get('probeDepth'), units),
        probeFeedrate: mapValueToUnits(this.config.get('probeFeedrate'), units),
        retractionDistance: mapValueToUnits(this.config.get('retractionDistance'), units),
        touchPlateHeight: mapValueToUnits(this.config.get('touchPlateHeight'), units),
        units,
      });
    },
    'workflow:state': workflowState => {
      this.setState(() => ({
        workflow: {
          state: workflowState,
        },
      }));
    },
  };

  unitsDidChange = false;

  componentDidMount() {
    this.addControllerEvents();
  }

  componentWillUnmount() {
    this.removeControllerEvents();
  }

  componentDidUpdate() {
    const {minimized} = this.state;

    this.config.set('minimized', minimized);

    // Do not save config settings if the units did change between in and mm
    if (this.unitsDidChange) {
      this.unitsDidChange = false;
      return;
    }

    const {units, probeCommand, useTLO} = this.state;
    this.config.set('probeCommand', probeCommand);
    this.config.set('useTLO', useTLO);

    let {probeDepth, probeFeedrate, touchPlateHeight, retractionDistance} = this.state;

    // To save in mm
    if (units === IMPERIAL_UNITS) {
      probeDepth = in2mm(probeDepth);
      probeFeedrate = in2mm(probeFeedrate);
      touchPlateHeight = in2mm(touchPlateHeight);
      retractionDistance = in2mm(retractionDistance);
    }

    this.config.set('probeDepth', Number(probeDepth));
    this.config.set('probeFeedrate', Number(probeFeedrate));
    this.config.set('touchPlateHeight', Number(touchPlateHeight));
    this.config.set('retractionDistance', Number(retractionDistance));
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

    if (!controller.connection.ident) {
      return false;
    }

    if (controller.type === GRBL && !includes([GRBL_MACHINE_STATE_IDLE], machineState)) {
      return false;
    }

    if (controller.type === MARLIN) {
      // Marlin does not have machine state
    }

    if (controller.type === SMOOTHIE && !includes([SMOOTHIE_MACHINE_STATE_IDLE], machineState)) {
      return false;
    }

    if (
      controller.type === TINYG &&
      !includes([TINYG_MACHINE_STATE_READY, TINYG_MACHINE_STATE_STOP, TINYG_MACHINE_STATE_END], machineState)
    ) {
      return false;
    }

    if (controller.workflow.state === WORKFLOW_STATE_RUNNING) {
      return false;
    }

    return true;
  }
}

export default ProbeWidget;
