import pubsub from 'pubsub-js';
import React, {Component, Fragment} from 'react';
import {includes, isEqual} from 'lodash';

import controller from '../../lib/controller';

import store from '../../store_old';

import {GRBL, MARLIN, SMOOTHIE, TINYG} from '../../constants';

import Widget from './Widget';

class SecondaryWidgets extends Component {
  state = {
    widgets: store.get('workspace.container.secondary.widgets'),
  };

  pubsubTokens = [];
  widgetMap = {};

  componentDidMount() {
    this.subscribe();
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  shouldComponentUpdate(nextProps, nextState) {
    // Do not compare props for performance considerations
    return !isEqual(nextState, this.state);
  }

  componentDidUpdate() {
    const {widgets} = this.state;

    // Calling store.set() will merge two different arrays into one.
    // Remove the property first to avoid duplication.
    store.replace('workspace.container.secondary.widgets', widgets);
  }

  subscribe() {
    {
      // updateSecondaryWidgets
      const token = pubsub.subscribe('updateSecondaryWidgets', (msg, widgets) => {
        this.setState({widgets});
      });
      this.pubsubTokens.push(token);
    }
  }

  unsubscribe() {
    this.pubsubTokens.forEach(token => {
      pubsub.unsubscribe(token);
    });
    this.pubsubTokens = [];
  }

  render() {
    const removeUnavailableControllers = widgetId => {
      // e.g. "webcam" or "webcam:d8e6352f-80a9-475f-a4f5-3e9197a48a23"
      const name = widgetId.split(':')[0];

      if (name === 'grbl' && !includes(controller.availableControllers, GRBL)) {
        return false;
      }

      if (name === 'marlin' && !includes(controller.availableControllers, MARLIN)) {
        return false;
      }

      if (name === 'smoothie' && !includes(controller.availableControllers, SMOOTHIE)) {
        return false;
      }

      if (name === 'tinyg' && !includes(controller.availableControllers, TINYG)) {
        return false;
      }

      return true;
    };

    const widgets = this.state.widgets.filter(removeUnavailableControllers).map(widgetId => (
      <div key={widgetId} data-widget-id={widgetId} className="u-margin-bottom-small">
        <Widget
          ref={node => {
            if (node && node.widget) {
              this.widgetMap[widgetId] = node.widget;
            }
          }}
          widgetId={widgetId}
        />
      </div>
    ));

    return <Fragment>{widgets}</Fragment>;
  }
}

export default SecondaryWidgets;
