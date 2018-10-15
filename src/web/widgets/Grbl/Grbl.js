import _ from 'lodash';
import ensureArray from 'ensure-array';
import PropTypes from 'prop-types';
import React, {PureComponent} from 'react';
import {ProgressBar} from 'react-bootstrap';

import i18n from '../../lib/i18n';
import mapGCodeToText from '../../lib/gcode-text';

import Overrides from './Overrides';
import Panel from '../../components/Panel';
import Toggler from '../../components/Toggler';

import styles from './index.styl';

class Grbl extends PureComponent {
  static propTypes = {
    actions: PropTypes.object,
    state: PropTypes.object,
  };

  // https://github.com/grbl/grbl/wiki/Interfacing-with-Grbl
  // Grbl v0.9: BLOCK_BUFFER_SIZE (18), RX_BUFFER_SIZE (128)
  // Grbl v1.1: BLOCK_BUFFER_SIZE (16), RX_BUFFER_SIZE (128)
  plannerBufferMax = 0;
  plannerBufferMin = 0;
  receiveBufferMax = 128;
  receiveBufferMin = 0;

  render() {
    const {state, actions} = this.props;

    const none = '–';
    const panel = state.panel;
    const controllerState = state.controller.state || {};
    const machineState = _.get(controllerState, 'machineState') || none;
    const feedrate = _.get(controllerState, 'feedrate', none);
    const spindle = _.get(controllerState, 'spindle', none);
    const tool = _.get(controllerState, 'tool', none);
    const ov = _.get(controllerState, 'ov', []);
    const [ovF = 0, ovR = 0, ovS = 0] = ov;
    const buf = _.get(controllerState, 'buf', {});
    const modal = _.mapValues(controllerState.modal || {}, mapGCodeToText);
    const receiveBufferStyle = (rx => {
      let localRx = rx;
      // danger: 0-7
      // warning: 8-15
      // info: >=16
      localRx = Number(localRx) || 0;
      if (localRx >= 16) {
        return 'info';
      }
      if (localRx >= 8) {
        return 'warning';
      }
      return 'danger';
    })(buf.rx);

    this.plannerBufferMax = Math.max(this.plannerBufferMax, buf.planner) || this.plannerBufferMax;
    this.receiveBufferMax = Math.max(this.receiveBufferMax, buf.rx) || this.receiveBufferMax;

    return (
      <div>
        <Overrides ovF={ovF} ovS={ovS} ovR={ovR} />
        {!_.isEmpty(buf) && (
          <Panel className={styles.panel}>
            <Panel.Heading className={styles['panel-heading']}>
              <Toggler
                className="clearfix"
                onToggle={actions.toggleQueueReports}
                title={panel.queueReports.expanded ? i18n._('Hide') : i18n._('Show')}
              >
                <div className="pull-left">{i18n._('Queue Reports')}</div>
                <Toggler.Icon className="pull-right" expanded={panel.queueReports.expanded} />
              </Toggler>
            </Panel.Heading>
            {panel.queueReports.expanded && (
              <Panel.Body>
                <div className="row no-gutters">
                  <div className="col col-xs-4">
                    <div className={styles.textEllipsis} title={i18n._('Planner Buffer')}>
                      {i18n._('Planner Buffer')}
                    </div>
                  </div>
                  <div className="col col-xs-8">
                    <ProgressBar
                      style={{marginBottom: 0}}
                      bsStyle="info"
                      min={this.plannerBufferMin}
                      max={this.plannerBufferMax}
                      now={buf.planner}
                      label={<span className={styles.progressbarLabel}>{buf.planner}</span>}
                    />
                  </div>
                </div>
                <div className="row no-gutters">
                  <div className="col col-xs-4">
                    <div className={styles.textEllipsis} title={i18n._('Receive Buffer')}>
                      {i18n._('Receive Buffer')}
                    </div>
                  </div>
                  <div className="col col-xs-8">
                    <ProgressBar
                      style={{marginBottom: 0}}
                      bsStyle={receiveBufferStyle}
                      min={this.receiveBufferMin}
                      max={this.receiveBufferMax}
                      now={buf.rx}
                      label={<span className={styles.progressbarLabel}>{buf.rx}</span>}
                    />
                  </div>
                </div>
              </Panel.Body>
            )}
          </Panel>
        )}
        <Panel className={styles.panel}>
          <Panel.Heading className={styles['panel-heading']}>
            <Toggler
              className="clearfix"
              onToggle={() => {
                actions.toggleStatusReports();
              }}
              title={panel.statusReports.expanded ? i18n._('Hide') : i18n._('Show')}
            >
              <div className="pull-left">{i18n._('Status Reports')}</div>
              <Toggler.Icon className="pull-right" expanded={panel.statusReports.expanded} />
            </Toggler>
          </Panel.Heading>
          {panel.statusReports.expanded && (
            <Panel.Body>
              <div className="row no-gutters">
                <div className="col col-xs-4">
                  <div className={styles.textEllipsis} title={i18n._('State')}>
                    {i18n._('State')}
                  </div>
                </div>
                <div className="col col-xs-8">
                  <div className={styles.well}>{machineState}</div>
                </div>
              </div>
              <div className="row no-gutters">
                <div className="col col-xs-4">
                  <div className={styles.textEllipsis} title={i18n._('Feed Rate')}>
                    {i18n._('Feed Rate')}
                  </div>
                </div>
                <div className="col col-xs-8">
                  <div className={styles.well}>{feedrate}</div>
                </div>
              </div>
              <div className="row no-gutters">
                <div className="col col-xs-4">
                  <div className={styles.textEllipsis} title={i18n._('Spindle')}>
                    {i18n._('Spindle')}
                  </div>
                </div>
                <div className="col col-xs-8">
                  <div className={styles.well}>{spindle}</div>
                </div>
              </div>
              <div className="row no-gutters">
                <div className="col col-xs-4">
                  <div className={styles.textEllipsis} title={i18n._('Tool Number')}>
                    {i18n._('Tool Number')}
                  </div>
                </div>
                <div className="col col-xs-8">
                  <div className={styles.well}>{tool}</div>
                </div>
              </div>
            </Panel.Body>
          )}
        </Panel>
        <Panel className={styles.panel}>
          <Panel.Heading className={styles['panel-heading']}>
            <Toggler
              className="clearfix"
              onToggle={() => {
                actions.toggleModalGroups();
              }}
              title={panel.modalGroups.expanded ? i18n._('Hide') : i18n._('Show')}
            >
              <div className="pull-left">{i18n._('Modal Groups')}</div>
              <Toggler.Icon className="pull-right" expanded={panel.modalGroups.expanded} />
            </Toggler>
          </Panel.Heading>
          {panel.modalGroups.expanded && (
            <Panel.Body>
              <div className="row no-gutters">
                <div className="col col-xs-4">
                  <div className={styles.textEllipsis} title={i18n._('Motion')}>
                    {i18n._('Motion')}
                  </div>
                </div>
                <div className="col col-xs-8">
                  <div className={styles.well} title={modal.motion}>
                    {modal.motion || none}
                  </div>
                </div>
              </div>
              <div className="row no-gutters">
                <div className="col col-xs-4">
                  <div className={styles.textEllipsis} title={i18n._('Coordinate')}>
                    {i18n._('Coordinate')}
                  </div>
                </div>
                <div className="col col-xs-8">
                  <div className={styles.well} title={modal.wcs}>
                    {modal.wcs || none}
                  </div>
                </div>
              </div>
              <div className="row no-gutters">
                <div className="col col-xs-4">
                  <div className={styles.textEllipsis} title={i18n._('Plane')}>
                    {i18n._('Plane')}
                  </div>
                </div>
                <div className="col col-xs-8">
                  <div className={styles.well} title={modal.plane}>
                    {modal.plane || none}
                  </div>
                </div>
              </div>
              <div className="row no-gutters">
                <div className="col col-xs-4">
                  <div className={styles.textEllipsis} title={i18n._('Distance')}>
                    {i18n._('Distance')}
                  </div>
                </div>
                <div className="col col-xs-8">
                  <div className={styles.well} title={modal.distance}>
                    {modal.distance || none}
                  </div>
                </div>
              </div>
              <div className="row no-gutters">
                <div className="col col-xs-4">
                  <div className={styles.textEllipsis} title={i18n._('Feed Rate')}>
                    {i18n._('Feed Rate')}
                  </div>
                </div>
                <div className="col col-xs-8">
                  <div className={styles.well} title={modal.feedrate}>
                    {modal.feedrate || none}
                  </div>
                </div>
              </div>
              <div className="row no-gutters">
                <div className="col col-xs-4">
                  <div className={styles.textEllipsis} title={i18n._('Units')}>
                    {i18n._('Units')}
                  </div>
                </div>
                <div className="col col-xs-8">
                  <div className={styles.well} title={modal.units}>
                    {modal.units || none}
                  </div>
                </div>
              </div>
              <div className="row no-gutters">
                <div className="col col-xs-4">
                  <div className={styles.textEllipsis} title={i18n._('Program')}>
                    {i18n._('Program')}
                  </div>
                </div>
                <div className="col col-xs-8">
                  <div className={styles.well} title={modal.program}>
                    {modal.program || none}
                  </div>
                </div>
              </div>
              <div className="row no-gutters">
                <div className="col col-xs-4">
                  <div className={styles.textEllipsis} title={i18n._('Spindle')}>
                    {i18n._('Spindle')}
                  </div>
                </div>
                <div className="col col-xs-8">
                  <div className={styles.well} title={modal.spindle}>
                    {modal.spindle || none}
                  </div>
                </div>
              </div>
              <div className="row no-gutters">
                <div className="col col-xs-4">
                  <div className={styles.textEllipsis} title={i18n._('Coolant')}>
                    {i18n._('Coolant')}
                  </div>
                </div>
                <div className="col col-xs-8">
                  <div className={styles.well}>
                    {ensureArray(modal.coolant).map(coolant => (
                      <div title={coolant} key={coolant}>
                        {coolant || none}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Panel.Body>
          )}
        </Panel>
      </div>
    );
  }
}

export default Grbl;
