import PropTypes from 'prop-types';
import React, {PureComponent} from 'react';

import i18n from '../../lib/i18n';

import {METRIC_UNITS} from '../../constants';
import {MODAL_PREVIEW} from './constants';

import Button from '../../components_new/Button';
import ButtonGroup from '../../components_new/ButtonGroup';
import Hint from '../../components_new/Hint';

class Probe extends PureComponent {
  static propTypes = {
    actions: PropTypes.object,
    state: PropTypes.object,
  };

  render() {
    const {actions, state} = this.props;
    const {canClick} = state;

    return (
      <div>
        {this.probeCommand}
        <div>
          {this.probeDepth}
          {this.feedrate}
          {this.touchPlateHeight}
          {this.retractionDistance}
        </div>
        <div>
          <Button
            text={i18n._('Probe Z-Position')}
            isDisabled={!canClick}
            onClick={() => {
              actions.openModal(MODAL_PREVIEW);
            }}
          />
        </div>
      </div>
    );
  }

  get probeCommand() {
    const {changeProbeCommand} = this.props.actions;
    const {probeCommand} = this.props.state;

    let probeCommandHint;
    switch (probeCommand) {
      case 'G38.2':
        probeCommandHint = i18n._('G38.2 probe toward workpiece, stop on contact, signal error if failure');
        break;

      case 'G38.3':
        probeCommandHint = i18n._('G38.3 probe toward workpiece, stop on contact');
        break;

      case 'G38.4':
        probeCommandHint = i18n._('G38.4 probe away from workpiece, stop on loss of contact, signal error if failure');
        break;

      case 'G38.5':
        probeCommandHint = i18n._('G38.5 probe away from workpiece, stop on loss of contact');
        break;
    }

    return (
      <div className="form-group">
        <label className="control-label">{i18n._('Probe Command')}</label>
        <ButtonGroup
          optionName="probe-command"
          options={['G38.2', 'G38.3', 'G38.4', 'G38.5']}
          selectedValue={probeCommand}
          onChange={changeProbeCommand}
        />
        <Hint className="u-margin-top-tiny" block>
          {probeCommandHint}
        </Hint>
      </div>
    );
  }

  get probeDepth() {
    const {handleProbeDepthChange} = this.props.actions;
    const {probeDepth, units} = this.props.state;

    const displayUnits = units === METRIC_UNITS ? i18n._('mm') : i18n._('in');
    const step = units === METRIC_UNITS ? 1 : 0.1;

    return (
      <div className="form-group">
        <label className="control-label">{i18n._('Probe Depth')}</label>
        <div className="input-group input-group-sm">
          <input
            type="number"
            className="form-control"
            value={probeDepth}
            placeholder="0.00"
            min={0}
            step={step}
            onChange={handleProbeDepthChange}
          />
          <div className="input-group-addon">{displayUnits}</div>
        </div>
      </div>
    );
  }

  get feedrate() {
    const {handleProbeFeedrateChange} = this.props.actions;
    const {probeFeedrate, units} = this.props.state;

    const feedrateUnits = units === METRIC_UNITS ? i18n._('mm/min') : i18n._('in/min');
    const step = units === METRIC_UNITS ? 1 : 0.1;

    return (
      <div className="form-group">
        <label className="control-label">{i18n._('Probe Feedrate')}</label>
        <div className="input-group input-group-sm">
          <input
            type="number"
            className="form-control"
            value={probeFeedrate}
            placeholder="0.00"
            min={0}
            step={step}
            onChange={handleProbeFeedrateChange}
          />
          <span className="input-group-addon">{feedrateUnits}</span>
        </div>
      </div>
    );
  }

  get touchPlateHeight() {
    const {handleTouchPlateHeightChange} = this.props.actions;
    const {touchPlateHeight, units} = this.props.state;

    const displayUnits = units === METRIC_UNITS ? i18n._('mm') : i18n._('in');
    const step = units === METRIC_UNITS ? 1 : 0.1;

    return (
      <div className="form-group">
        <label className="control-label">{i18n._('Touch Plate Thickness')}</label>
        <div className="input-group input-group-sm">
          <input
            type="number"
            className="form-control"
            value={touchPlateHeight}
            placeholder="0.00"
            min={0}
            step={step}
            onChange={handleTouchPlateHeightChange}
          />
          <span className="input-group-addon">{displayUnits}</span>
        </div>
      </div>
    );
  }

  get retractionDistance() {
    const {handleRetractionDistanceChange} = this.props.actions;
    const {retractionDistance, units} = this.props.state;

    const displayUnits = units === METRIC_UNITS ? i18n._('mm') : i18n._('in');
    const step = units === METRIC_UNITS ? 1 : 0.1;

    return (
      <div className="form-group">
        <label className="control-label">{i18n._('Retraction Distance')}</label>
        <div className="input-group input-group-sm">
          <input
            type="number"
            className="form-control"
            value={retractionDistance}
            placeholder="0.00"
            min={0}
            step={step}
            onChange={handleRetractionDistanceChange}
          />
          <span className="input-group-addon">{displayUnits}</span>
        </div>
      </div>
    );
  }
}

export default Probe;
