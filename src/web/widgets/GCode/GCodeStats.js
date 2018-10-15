import PropTypes from 'prop-types';
import React, {PureComponent} from 'react';

import i18n from '../../lib/i18n';
import {formatDate, formatDuration, time24h} from '../../lib/l10n';

import {METRIC_UNITS} from '../../constants';

class GCodeStats extends PureComponent {
  static propTypes = {
    state: PropTypes.object,
  };

  render() {
    const {state} = this.props;
    const {bbox, received, sent, total, units} = state;

    const displayUnits = units === METRIC_UNITS ? i18n._('mm') : i18n._('in');

    const startTime = formatDate(state.startTime, time24h);
    const finishTime = formatDate(state.finishTime, time24h);
    const elapsedTime = formatDuration(state.elapsedTime);
    const remainingTime = formatDuration(state.remainingTime);

    return (
      <div>
        <div className="row no-gutters" style={{marginBottom: 10}}>
          <div className="col-xs-12">
            <table className="table">
              <thead>
                <tr>
                  <th />
                  <th className="number-cell">{i18n._('Min')}</th>
                  <th className="number-cell">{i18n._('Max')}</th>
                  <th className="number-cell">{i18n._('Dimension')}</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th>X</th>
                  <td className="number-cell">
                    {bbox.min.x}
                    <span className="unit">{displayUnits}</span>
                  </td>
                  <td className="number-cell">
                    {bbox.max.x}
                    <span className="unit">{displayUnits}</span>
                  </td>
                  <td className="number-cell">
                    {bbox.delta.x}
                    <span className="unit">{displayUnits}</span>
                  </td>
                </tr>
                <tr>
                  <th>Y</th>
                  <td className="number-cell">
                    {bbox.min.y}
                    <span className="unit">{displayUnits}</span>
                  </td>
                  <td className="number-cell">
                    {bbox.max.y}
                    <span className="unit">{displayUnits}</span>
                  </td>
                  <td className="number-cell">
                    {bbox.delta.y}
                    <span className="unit">{displayUnits}</span>
                  </td>
                </tr>
                <tr>
                  <th>Z</th>
                  <td className="number-cell">
                    {bbox.min.z}
                    <span className="unit">{displayUnits}</span>
                  </td>
                  <td className="number-cell">
                    {bbox.max.z}
                    <span className="unit">{displayUnits}</span>
                  </td>
                  <td className="number-cell">
                    {bbox.delta.z}
                    <span className="unit">{displayUnits}</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div className="row no-gutters" style={{marginBottom: 10}}>
          <div className="col-xs-6">
            <div>{i18n._('Sent')}</div>
            <div>{total > 0 ? `${sent} / ${total}` : '–'}</div>
          </div>
          <div className="col-xs-6">
            <div>{i18n._('Received')}</div>
            <div>{total > 0 ? `${received} / ${total}` : '–'}</div>
          </div>
        </div>
        <div className="row no-gutters" style={{marginBottom: 10}}>
          <div className="col-xs-6">
            <div>{i18n._('Start Time')}</div>
            <div>{startTime}</div>
          </div>
          <div className="col-xs-6">
            <div>{i18n._('Elapsed Time')}</div>
            <div>{elapsedTime}</div>
          </div>
        </div>
        <div className="row no-gutters">
          <div className="col-xs-6">
            <div>{i18n._('Finish Time')}</div>
            <div>{finishTime}</div>
          </div>
          <div className="col-xs-6">
            <div>{i18n._('Remaining Time')}</div>
            <div>{remainingTime}</div>
          </div>
        </div>
      </div>
    );
  }
}

export default GCodeStats;
