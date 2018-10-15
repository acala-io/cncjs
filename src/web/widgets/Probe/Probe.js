import PropTypes from 'prop-types';
import React, {PureComponent} from 'react';

import i18n from '../../lib/i18n';

import {METRIC_UNITS} from '../../constants';
import {MODAL_PREVIEW} from './constants';

import ButtonGroup from '../../components_new/ButtonGroup';
import Hint from '../../components_new/Hint';

class Probe extends PureComponent {
  static propTypes = {
    actions: PropTypes.object,
    state: PropTypes.object,
  };

  render() {
    const {actions, state} = this.props;
    const {canClick, units, probeCommand, probeDepth, probeFeedrate, touchPlateHeight, retractionDistance} = state;

    const displayUnits = units === METRIC_UNITS ? i18n._('mm') : i18n._('in');
    const feedrateUnits = units === METRIC_UNITS ? i18n._('mm/min') : i18n._('in/min');
    const step = units === METRIC_UNITS ? 1 : 0.1;

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
      <div>
        <div className="form-group">
          <label className="control-label">{i18n._('Probe Command')}</label>
          <ButtonGroup
            optionName="probe-command"
            options={['G38.2', 'G38.3', 'G38.4', 'G38.5']}
            selectedValue={probeCommand}
            onChange={actions.changeProbeCommand}
          />
          <Hint className="u-margin-top-tiny" block>
            {probeCommandHint}
          </Hint>
        </div>
        <div className="row no-gutters">
          <div className="col-xs-6" style={{paddingRight: 5}}>
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
                  onChange={actions.handleProbeDepthChange}
                />
                <div className="input-group-addon">{displayUnits}</div>
              </div>
            </div>
          </div>
          <div className="col-xs-6" style={{paddingLeft: 5}}>
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
                  onChange={actions.handleProbeFeedrateChange}
                />
                <span className="input-group-addon">{feedrateUnits}</span>
              </div>
            </div>
          </div>
          <div className="col-xs-6" style={{paddingRight: 5}}>
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
                  onChange={actions.handleTouchPlateHeightChange}
                />
                <span className="input-group-addon">{displayUnits}</span>
              </div>
            </div>
          </div>
          <div className="col-xs-6" style={{paddingLeft: 5}}>
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
                  onChange={actions.handleRetractionDistanceChange}
                />
                <span className="input-group-addon">{displayUnits}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="row no-gutters">
          <div className="col-xs-12">
            <button
              type="button"
              className="btn btn-sm btn-default"
              onClick={() => {
                actions.openModal(MODAL_PREVIEW);
              }}
              disabled={!canClick}
            >
              {i18n._('Z-Probe')}
            </button>
          </div>
        </div>
      </div>
    );
  }
}

export default Probe;
