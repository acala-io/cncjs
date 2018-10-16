import ensureArray from 'ensure-array';
import PropTypes from 'prop-types';
import React, {PureComponent} from 'react';
import {get, mapValues} from 'lodash';

import i18n from '../../lib/i18n';
import mapGCodeToText from '../../lib/gcode-text';

import Overrides from './Overrides';
import Panel from '../../components/Panel';
import Toggler from '../../components/Toggler';

import './index.scss';

class Smoothie extends PureComponent {
  static propTypes = {
    actions: PropTypes.object,
    state: PropTypes.object,
  };

  render() {
    const {actions, state} = this.props;

    const none = '–';
    const panel = state.panel;
    const controllerState = state.controller.state || {};
    const machineState = get(controllerState, 'machineState', none);
    const ovF = get(controllerState, 'ovF', 0);
    const ovS = get(controllerState, 'ovS', 0);
    const feedrate = get(controllerState, 'feedrate', none);
    const spindle = get(controllerState, 'spindle', none);
    const tool = get(controllerState, 'tool', none);
    const modal = mapValues(controllerState.modal || {}, mapGCodeToText);

    return (
      <div>
        <Overrides ovF={ovF} ovS={ovS} />
        <Panel className="panel">
          <Panel.Heading className={'panel-heading'}>
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
                  <div className="text-ellipsis" title={i18n._('State')}>
                    {i18n._('State')}
                  </div>
                </div>
                <div className="col col-xs-8">
                  <div className="well">{machineState}</div>
                </div>
              </div>
              <div className="row no-gutters">
                <div className="col col-xs-4">
                  <div className="text-ellipsis" title={i18n._('Feed Rate')}>
                    {i18n._('Feed Rate')}
                  </div>
                </div>
                <div className="col col-xs-8">
                  <div className="well">{feedrate}</div>
                </div>
              </div>
              <div className="row no-gutters">
                <div className="col col-xs-4">
                  <div className="text-ellipsis" title={i18n._('Spindle')}>
                    {i18n._('Spindle')}
                  </div>
                </div>
                <div className="col col-xs-8">
                  <div className="well">{spindle}</div>
                </div>
              </div>
              <div className="row no-gutters">
                <div className="col col-xs-4">
                  <div className="text-ellipsis" title={i18n._('Tool Number')}>
                    {i18n._('Tool Number')}
                  </div>
                </div>
                <div className="col col-xs-8">
                  <div className="well">{tool}</div>
                </div>
              </div>
            </Panel.Body>
          )}
        </Panel>
        <Panel className="panel">
          <Panel.Heading className={'panel-heading'}>
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
                  <div className="text-ellipsis" title={i18n._('Motion')}>
                    {i18n._('Motion')}
                  </div>
                </div>
                <div className="col col-xs-8">
                  <div className="well" title={modal.motion}>
                    {modal.motion || none}
                  </div>
                </div>
              </div>
              <div className="row no-gutters">
                <div className="col col-xs-4">
                  <div className="text-ellipsis" title={i18n._('Coordinate')}>
                    {i18n._('Coordinate')}
                  </div>
                </div>
                <div className="col col-xs-8">
                  <div className="well" title={modal.wcs}>
                    {modal.wcs || none}
                  </div>
                </div>
              </div>
              <div className="row no-gutters">
                <div className="col col-xs-4">
                  <div className="text-ellipsis" title={i18n._('Plane')}>
                    {i18n._('Plane')}
                  </div>
                </div>
                <div className="col col-xs-8">
                  <div className="well" title={modal.plane}>
                    {modal.plane || none}
                  </div>
                </div>
              </div>
              <div className="row no-gutters">
                <div className="col col-xs-4">
                  <div className="text-ellipsis" title={i18n._('Distance')}>
                    {i18n._('Distance')}
                  </div>
                </div>
                <div className="col col-xs-8">
                  <div className="well" title={modal.distance}>
                    {modal.distance || none}
                  </div>
                </div>
              </div>
              <div className="row no-gutters">
                <div className="col col-xs-4">
                  <div className="text-ellipsis" title={i18n._('Feed Rate')}>
                    {i18n._('Feed Rate')}
                  </div>
                </div>
                <div className="col col-xs-8">
                  <div className="well" title={modal.feedrate}>
                    {modal.feedrate || none}
                  </div>
                </div>
              </div>
              <div className="row no-gutters">
                <div className="col col-xs-4">
                  <div className="text-ellipsis" title={i18n._('Units')}>
                    {i18n._('Units')}
                  </div>
                </div>
                <div className="col col-xs-8">
                  <div className="well" title={modal.units}>
                    {modal.units || none}
                  </div>
                </div>
              </div>
              <div className="row no-gutters">
                <div className="col col-xs-4">
                  <div className="text-ellipsis" title={i18n._('Program')}>
                    {i18n._('Program')}
                  </div>
                </div>
                <div className="col col-xs-8">
                  <div className="well" title={modal.program}>
                    {modal.program || none}
                  </div>
                </div>
              </div>
              <div className="row no-gutters">
                <div className="col col-xs-4">
                  <div className="text-ellipsis" title={i18n._('Spindle')}>
                    {i18n._('Spindle')}
                  </div>
                </div>
                <div className="col col-xs-8">
                  <div className="well" title={modal.spindle}>
                    {modal.spindle || none}
                  </div>
                </div>
              </div>
              <div className="row no-gutters">
                <div className="col col-xs-4">
                  <div className="text-ellipsis" title={i18n._('Coolant')}>
                    {i18n._('Coolant')}
                  </div>
                </div>
                <div className="col col-xs-8">
                  <div className="well">
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

export default Smoothie;
