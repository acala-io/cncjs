import classcat from 'classcat';
import PropTypes from 'prop-types';
import pubsub from 'pubsub-js';
import React, {PureComponent} from 'react';
import {mapValues} from 'lodash';

import controller from '../../lib/controller';
import i18n from '../../lib/i18n';
import {mapPositionToUnits} from '../../lib/units';

import {
  // Units
  IMPERIAL_UNITS,
  METRIC_UNITS,
  // Controller
  GRBL,
  MARLIN,
  SMOOTHIE,
  TINYG,
} from '../../constants';

import Card, {CardHeader} from '../../components_new/Card';
import GCodeStats from './GCodeStats';
import Padding from '../../components_new/Padding';
import WidgetConfig from '../WidgetConfig';

class GCodeWidget extends PureComponent {
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
    return {
      minimized: this.config.get('minimized', false),
      units: METRIC_UNITS,

      // G-code status (from server)
      elapsedTime: 0,
      finishTime: 0,
      received: 0,
      remainingTime: 0,
      sent: 0,
      startTime: 0,
      total: 0,

      // Bounding box
      bbox: {
        min: {
          x: 0,
          y: 0,
          z: 0,
        },
        max: {
          x: 0,
          y: 0,
          z: 0,
        },
        delta: {
          x: 0,
          y: 0,
          z: 0,
        },
      },
    };
  }

  pubsubTokens = [];

  render() {
    const {bbox, minimized, units} = this.state;

    const state = {
      ...this.state,
      bbox: mapValues(bbox, position => mapValues(position, pos => mapPositionToUnits(pos, units))),
    };

    const actions = {
      toggleMinimized: () => {
        this.setState({
          minimized: !this.state.minimized,
        });
      },
    };

    return (
      <Card noPad shadow>
        <CardHeader>
          <h3 onMouseDown={actions.toggleMinimized}>{i18n._('G-code')}</h3>
        </CardHeader>
        <div className={classcat([{hidden: minimized}])}>
          <Padding size="small">
            <GCodeStats state={state} actions={actions} />
          </Padding>
        </div>
      </Card>
    );
  }

  controllerEvents = {
    'sender:unload': () => {
      this.setState({
        bbox: {
          min: {
            x: 0,
            y: 0,
            z: 0,
          },
          max: {
            x: 0,
            y: 0,
            z: 0,
          },
          delta: {
            x: 0,
            y: 0,
            z: 0,
          },
        },
      });
    },
    'sender:status': data => {
      const {total, sent, received, startTime, finishTime, elapsedTime, remainingTime} = data;

      this.setState({
        total,
        sent,
        received,
        startTime,
        finishTime,
        elapsedTime,
        remainingTime,
      });
    },
    'controller:state': (type, state) => {
      // Grbl
      if (type === GRBL) {
        const {modal = {}} = {...state};
        const units =
          {
            G20: IMPERIAL_UNITS,
            G21: METRIC_UNITS,
          }[modal.units] || this.state.units;

        if (this.state.units !== units) {
          this.setState({units});
        }
      }

      // Marlin
      if (type === MARLIN) {
        const {modal = {}} = {...state};
        const units =
          {
            G20: IMPERIAL_UNITS,
            G21: METRIC_UNITS,
          }[modal.units] || this.state.units;

        if (this.state.units !== units) {
          this.setState({units});
        }
      }

      // Smoothie
      if (type === SMOOTHIE) {
        const {modal = {}} = {...state};
        const units =
          {
            G20: IMPERIAL_UNITS,
            G21: METRIC_UNITS,
          }[modal.units] || this.state.units;

        if (this.state.units !== units) {
          this.setState({units});
        }
      }

      // TinyG
      if (type === TINYG) {
        const {modal = {}} = {...state};
        const units =
          {
            G20: IMPERIAL_UNITS,
            G21: METRIC_UNITS,
          }[modal.units] || this.state.units;

        if (this.state.units !== units) {
          this.setState({units});
        }
      }
    },
  };

  componentDidMount() {
    this.subscribe();
    this.addControllerEvents();
  }

  componentWillUnmount() {
    this.removeControllerEvents();
    this.unsubscribe();
  }

  componentDidUpdate() {
    this.config.set('minimized', this.state.minimized);
  }

  subscribe() {
    const tokens = [
      pubsub.subscribe('gcode:bbox', (msg, bbox) => {
        const dX = bbox.max.x - bbox.min.x;
        const dY = bbox.max.y - bbox.min.y;
        const dZ = bbox.max.z - bbox.min.z;

        this.setState({
          bbox: {
            min: {
              x: bbox.min.x,
              y: bbox.min.y,
              z: bbox.min.z,
            },
            max: {
              x: bbox.max.x,
              y: bbox.max.y,
              z: bbox.max.z,
            },
            delta: {
              x: dX,
              y: dY,
              z: dZ,
            },
          },
        });
      }),
    ];
    this.pubsubTokens = this.pubsubTokens.concat(tokens);
  }

  unsubscribe() {
    this.pubsubTokens.forEach(token => {
      pubsub.unsubscribe(token);
    });
    this.pubsubTokens = [];
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
}

export default GCodeWidget;
