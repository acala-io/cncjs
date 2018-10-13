import _ from 'lodash';
import classcat from 'classcat';
import PropTypes from 'prop-types';
import React, {PureComponent} from 'react';

import controller from '../../lib/controller';
import i18n from '../../lib/i18n';

import {
  // Controller
  GRBL,
  GRBL_MACHINE_STATE_IDLE,
  GRBL_MACHINE_STATE_RUN,
  GRBL_MACHINE_STATE_HOLD,
  GRBL_MACHINE_STATE_DOOR,
  GRBL_MACHINE_STATE_HOME,
  GRBL_MACHINE_STATE_SLEEP,
  GRBL_MACHINE_STATE_ALARM,
  GRBL_MACHINE_STATE_CHECK,
  MARLIN,
  SMOOTHIE,
  SMOOTHIE_MACHINE_STATE_IDLE,
  SMOOTHIE_MACHINE_STATE_RUN,
  SMOOTHIE_MACHINE_STATE_HOLD,
  SMOOTHIE_MACHINE_STATE_DOOR,
  SMOOTHIE_MACHINE_STATE_HOME,
  SMOOTHIE_MACHINE_STATE_SLEEP,
  SMOOTHIE_MACHINE_STATE_ALARM,
  SMOOTHIE_MACHINE_STATE_CHECK,
  TINYG,
  TINYG_MACHINE_STATE_INITIALIZING,
  TINYG_MACHINE_STATE_READY,
  TINYG_MACHINE_STATE_ALARM,
  TINYG_MACHINE_STATE_STOP,
  TINYG_MACHINE_STATE_END,
  TINYG_MACHINE_STATE_RUN,
  TINYG_MACHINE_STATE_HOLD,
  TINYG_MACHINE_STATE_PROBE,
  TINYG_MACHINE_STATE_CYCLE,
  TINYG_MACHINE_STATE_HOMING,
  TINYG_MACHINE_STATE_JOG,
  TINYG_MACHINE_STATE_INTERLOCK,
  TINYG_MACHINE_STATE_SHUTDOWN,
  TINYG_MACHINE_STATE_PANIC,
  // Workflow
  WORKFLOW_STATE_IDLE,
} from '../../constants';

import Dropdown, {MenuItem} from '../../components/Dropdown';

import styles from './index.styl';

class PrimaryToolbar extends PureComponent {
  static propTypes = {
    state: PropTypes.object,
  };

  render() {
    const {state} = this.props;
    const {wcs} = state;

    const controllerType = this.renderControllerType();
    const controllerState = this.renderControllerState();
    const canSendCommand = this.canSendCommand();

    return (
      <div className={styles.primaryToolbar}>
        {controllerType}
        {controllerState}
        <div className="pull-right">
          <Dropdown style={{marginRight: 5}} disabled={!canSendCommand} pullRight>
            <Dropdown.Toggle btnSize="sm" title={i18n._('Work Coordinate System')}>
              {wcs === 'G54' && `${wcs} (P1)`}
              {wcs === 'G55' && `${wcs} (P2)`}
              {wcs === 'G56' && `${wcs} (P3)`}
              {wcs === 'G57' && `${wcs} (P4)`}
              {wcs === 'G58' && `${wcs} (P5)`}
              {wcs === 'G59' && `${wcs} (P6)`}
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <MenuItem header>{i18n._('Work Coordinate System')}</MenuItem>
              <MenuItem
                active={wcs === 'G54'}
                onSelect={() => {
                  controller.command('gcode', 'G54');
                }}
              >
                G54 (P1)
              </MenuItem>
              <MenuItem
                active={wcs === 'G55'}
                onSelect={() => {
                  controller.command('gcode', 'G55');
                }}
              >
                G55 (P2)
              </MenuItem>
              <MenuItem
                active={wcs === 'G56'}
                onSelect={() => {
                  controller.command('gcode', 'G56');
                }}
              >
                G56 (P3)
              </MenuItem>
              <MenuItem
                active={wcs === 'G57'}
                onSelect={() => {
                  controller.command('gcode', 'G57');
                }}
              >
                G57 (P4)
              </MenuItem>
              <MenuItem
                active={wcs === 'G58'}
                onSelect={() => {
                  controller.command('gcode', 'G58');
                }}
              >
                G58 (P5)
              </MenuItem>
              <MenuItem
                active={wcs === 'G59'}
                onSelect={() => {
                  controller.command('gcode', 'G59');
                }}
              >
                G59 (P6)
              </MenuItem>
            </Dropdown.Menu>
          </Dropdown>
        </div>
      </div>
    );
  }

  canSendCommand() {
    if (!controller.connection.ident) {
      return false;
    }

    if (controller.workflow.state !== WORKFLOW_STATE_IDLE) {
      return false;
    }

    return true;
  }

  renderControllerType() {
    const {state} = this.props;
    const controllerType = state.controller.type;

    return <div className={styles.controllerType}>{controllerType}</div>;
  }

  renderControllerState() {
    const {state} = this.props;
    const controllerType = state.controller.type;
    const controllerState = state.controller.state;
    let stateStyle = '';
    let stateText = '';

    if (controllerType === GRBL) {
      const machineState = _.get(controllerState, 'machineState');

      stateStyle = {
        [GRBL_MACHINE_STATE_IDLE]: 'controller-state-default',
        [GRBL_MACHINE_STATE_RUN]: 'controller-state-primary',
        [GRBL_MACHINE_STATE_HOLD]: 'controller-state-warning',
        [GRBL_MACHINE_STATE_DOOR]: 'controller-state-warning',
        [GRBL_MACHINE_STATE_HOME]: 'controller-state-primary',
        [GRBL_MACHINE_STATE_SLEEP]: 'controller-state-success',
        [GRBL_MACHINE_STATE_ALARM]: 'controller-state-danger',
        [GRBL_MACHINE_STATE_CHECK]: 'controller-state-info',
      }[machineState];

      stateText = {
        [GRBL_MACHINE_STATE_IDLE]: i18n.t('controller:Grbl.machineState.idle'),
        [GRBL_MACHINE_STATE_RUN]: i18n.t('controller:Grbl.machineState.run'),
        [GRBL_MACHINE_STATE_HOLD]: i18n.t('controller:Grbl.machineState.hold'),
        [GRBL_MACHINE_STATE_DOOR]: i18n.t('controller:Grbl.machineState.door'),
        [GRBL_MACHINE_STATE_HOME]: i18n.t('controller:Grbl.machineState.home'),
        [GRBL_MACHINE_STATE_SLEEP]: i18n.t('controller:Grbl.machineState.sleep'),
        [GRBL_MACHINE_STATE_ALARM]: i18n.t('controller:Grbl.machineState.alarm'),
        [GRBL_MACHINE_STATE_CHECK]: i18n.t('controller:Grbl.machineState.check'),
      }[machineState];
    }

    if (controllerType === MARLIN) {
      // Marlin does not have machine state
    }

    if (controllerType === SMOOTHIE) {
      const machineState = _.get(controllerState, 'machineState');

      stateStyle = {
        [SMOOTHIE_MACHINE_STATE_IDLE]: 'controller-state-default',
        [SMOOTHIE_MACHINE_STATE_RUN]: 'controller-state-primary',
        [SMOOTHIE_MACHINE_STATE_HOLD]: 'controller-state-warning',
        [SMOOTHIE_MACHINE_STATE_DOOR]: 'controller-state-warning',
        [SMOOTHIE_MACHINE_STATE_HOME]: 'controller-state-primary',
        [SMOOTHIE_MACHINE_STATE_SLEEP]: 'controller-state-success',
        [SMOOTHIE_MACHINE_STATE_ALARM]: 'controller-state-danger',
        [SMOOTHIE_MACHINE_STATE_CHECK]: 'controller-state-info',
      }[machineState];

      stateText = {
        [SMOOTHIE_MACHINE_STATE_IDLE]: i18n.t('controller:Smoothie.machineState.idle'),
        [SMOOTHIE_MACHINE_STATE_RUN]: i18n.t('controller:Smoothie.machineState.run'),
        [SMOOTHIE_MACHINE_STATE_HOLD]: i18n.t('controller:Smoothie.machineState.hold'),
        [SMOOTHIE_MACHINE_STATE_DOOR]: i18n.t('controller:Smoothie.machineState.door'),
        [SMOOTHIE_MACHINE_STATE_HOME]: i18n.t('controller:Smoothie.machineState.home'),
        [SMOOTHIE_MACHINE_STATE_SLEEP]: i18n.t('controller:Smoothie.machineState.sleep'),
        [SMOOTHIE_MACHINE_STATE_ALARM]: i18n.t('controller:Smoothie.machineState.alarm'),
        [SMOOTHIE_MACHINE_STATE_CHECK]: i18n.t('controller:Smoothie.machineState.check'),
      }[machineState];
    }

    if (controllerType === TINYG) {
      const machineState = _.get(controllerState, 'machineState');

      // https://github.com/synthetos/g2/wiki/Alarm-Processing
      stateStyle = {
        [TINYG_MACHINE_STATE_INITIALIZING]: 'controller-state-warning',
        [TINYG_MACHINE_STATE_READY]: 'controller-state-default',
        [TINYG_MACHINE_STATE_ALARM]: 'controller-state-danger',
        [TINYG_MACHINE_STATE_STOP]: 'controller-state-default',
        [TINYG_MACHINE_STATE_END]: 'controller-state-default',
        [TINYG_MACHINE_STATE_RUN]: 'controller-state-primary',
        [TINYG_MACHINE_STATE_HOLD]: 'controller-state-warning',
        [TINYG_MACHINE_STATE_PROBE]: 'controller-state-primary',
        [TINYG_MACHINE_STATE_CYCLE]: 'controller-state-primary',
        [TINYG_MACHINE_STATE_HOMING]: 'controller-state-primary',
        [TINYG_MACHINE_STATE_JOG]: 'controller-state-primary',
        [TINYG_MACHINE_STATE_INTERLOCK]: 'controller-state-warning',
        [TINYG_MACHINE_STATE_SHUTDOWN]: 'controller-state-danger',
        [TINYG_MACHINE_STATE_PANIC]: 'controller-state-danger',
      }[machineState];

      stateText = {
        [TINYG_MACHINE_STATE_INITIALIZING]: i18n.t('controller:TinyG.machineState.initializing'),
        [TINYG_MACHINE_STATE_READY]: i18n.t('controller:TinyG.machineState.ready'),
        [TINYG_MACHINE_STATE_ALARM]: i18n.t('controller:TinyG.machineState.alarm'),
        [TINYG_MACHINE_STATE_STOP]: i18n.t('controller:TinyG.machineState.stop'),
        [TINYG_MACHINE_STATE_END]: i18n.t('controller:TinyG.machineState.end'),
        [TINYG_MACHINE_STATE_RUN]: i18n.t('controller:TinyG.machineState.run'),
        [TINYG_MACHINE_STATE_HOLD]: i18n.t('controller:TinyG.machineState.hold'),
        [TINYG_MACHINE_STATE_PROBE]: i18n.t('controller:TinyG.machineState.probe'),
        [TINYG_MACHINE_STATE_CYCLE]: i18n.t('controller:TinyG.machineState.cycle'),
        [TINYG_MACHINE_STATE_HOMING]: i18n.t('controller:TinyG.machineState.homing'),
        [TINYG_MACHINE_STATE_JOG]: i18n.t('controller:TinyG.machineState.jog'),
        [TINYG_MACHINE_STATE_INTERLOCK]: i18n.t('controller:TinyG.machineState.interlock'),
        [TINYG_MACHINE_STATE_SHUTDOWN]: i18n.t('controller:TinyG.machineState.shutdown'),
        [TINYG_MACHINE_STATE_PANIC]: i18n.t('controller:TinyG.machineState.panic'),
      }[machineState];
    }

    return <div className={classcat([styles.controllerState, styles[stateStyle]])}>{stateText}</div>;
  }
}

export default PrimaryToolbar;
