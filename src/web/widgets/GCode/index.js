import mapValues from 'lodash/mapValues';
import PropTypes from 'prop-types';
import pubsub from 'pubsub-js';
import React, {PureComponent} from 'react';

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

import GCodeStats from './GCodeStats';
import Widget from '../../components/Widget';
import WidgetConfig from '../WidgetConfig';

import styles from './index.styl';

class GCodeWidget extends PureComponent {
  static propTypes = {
    widgetId: PropTypes.string.isRequired,
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
    const {bbox, units} = this.state;

    const state = {
      ...this.state,
      bbox: mapValues(bbox, position => mapValues(position, pos => mapPositionToUnits(pos, units))),
    };

    const actions = {};

    return (
      <Widget>
        <Widget.Header>
          <Widget.Title>{i18n._('G-code')}</Widget.Title>
        </Widget.Header>
        <Widget.Content className={styles['widget-content']}>
          <GCodeStats state={state} actions={actions} />
        </Widget.Content>
      </Widget>
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
          this.setState({units: units});
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
          this.setState({units: units});
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
          this.setState({units: units});
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
          this.setState({units: units});
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
