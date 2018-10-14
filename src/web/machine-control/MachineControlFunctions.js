import React from 'react';
import {connect} from 'react-redux';

import * as controllerActions from './actions';
import controller from '../lib/controller';
import i18n from '../lib/i18n';

import Button from '../components_new/Button';

const cyclestart = () => {
  controller.command('cyclestart');
};

const feedhold = () => {
  controller.command('feedhold');
};

const sleep = () => {
  controller.command('sleep');
};

const unlock = () => {
  controller.command('unlock');
};

const reset = () => {
  controller.command('reset');
};

const MachineControlFunctions = ({}) => {
  // TODO
  // const canClick = Boolean(connection.ident);
  // const isReady = canClick && gcode.ready;
  const canRun = true; // this.canRun();
  const canPause = false; // isReady && includes([WORKFLOW_STATE_RUNNING], workflow.state);
  const canStop = false; // isReady && includes([WORKFLOW_STATE_PAUSED], workflow.state);
  const canClose = true; // isReady && includes([WORKFLOW_STATE_IDLE], workflow.state);

  return (
    <div>
      {canRun && <Button text={i18n._('Cycle Start')} handleClick={cyclestart} />}
      {(canPause || canStop) && <Button text={i18n._('Feedhold')} handleClick={feedhold} />}
      {canClose && <Button text={i18n._('Sleep')} handleClick={sleep} />}
      <Button text={i18n._('Unlock')} handleClick={unlock} />
      <Button text={i18n._('Reset')} handleClick={reset} />
    </div>
  );
};

const mapStateToProps = state => ({
  ...state.controllers,
});

const mapDispatchToProps = dispatch => ({
  refresh: () => {
    dispatch(controllerActions.refresh());
  },
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(MachineControlFunctions);
