import chainedFunction from 'chained-function';
import get from 'lodash/get';
import includes from 'lodash/includes';
import isEqual from 'lodash/isEqual';
import PropTypes from 'prop-types';
import pubsub from 'pubsub-js';
import React, {Component, Fragment} from 'react';
import uuid from 'uuid';

import controller from '../../lib/controller';
import i18n from '../../lib/i18n';
import log from '../../lib/log';
import portal from '../../lib/portal';

import store from '../../store_old';

import {GRBL, MARLIN, SMOOTHIE, TINYG} from '../../constants';

import Modal from '../../components/Modal';
import Widget from './Widget';
import {Button} from '../../components/Buttons';

class PrimaryWidgets extends Component {
  static propTypes = {
    // onDragEnd: PropTypes.func.isRequired,
    // onDragStart: PropTypes.func.isRequired,
    onForkWidget: PropTypes.func.isRequired,
    onRemoveWidget: PropTypes.func.isRequired,
  };

  state = {
    widgets: store.get('workspace.container.primary.widgets'),
  };

  forkWidget = widgetId => () => {
    portal(({onClose}) => (
      <Modal size="xs" onClose={onClose}>
        <Modal.Header>
          <Modal.Title>{i18n._('Fork Widget')}</Modal.Title>
        </Modal.Header>
        <Modal.Body>{i18n._('Are you sure you want to fork this widget?')}</Modal.Body>
        <Modal.Footer>
          <Button onClick={onClose}>{i18n._('Cancel')}</Button>
          <Button
            btnStyle="primary"
            onClick={chainedFunction(() => {
              const name = widgetId.split(':')[0];
              if (!name) {
                log.error(`Failed to fork widget: widgetId=${widgetId}`);
                return;
              }

              // Use the same widget settings in a new widget
              const forkedWidgetId = `${name}:${uuid.v4()}`;
              const defaultSettings = store.get(`widgets["${name}"]`);
              const clonedSettings = store.get(`widgets["${widgetId}"]`, defaultSettings);
              store.set(`widgets["${forkedWidgetId}"]`, clonedSettings);

              const widgets = [...this.state.widgets, forkedWidgetId];
              this.setState({widgets: widgets});

              this.props.onForkWidget(widgetId);
            }, onClose)}
          >
            {i18n._('OK')}
          </Button>
        </Modal.Footer>
      </Modal>
    ));
  };

  removeWidget = widgetId => () => {
    portal(({onClose}) => (
      <Modal size="xs" onClose={onClose}>
        <Modal.Header>
          <Modal.Title>{i18n._('Remove Widget')}</Modal.Title>
        </Modal.Header>
        <Modal.Body>{i18n._('Are you sure you want to remove this widget?')}</Modal.Body>
        <Modal.Footer>
          <Button onClick={onClose}>{i18n._('Cancel')}</Button>
          <Button
            btnStyle="primary"
            onClick={chainedFunction(() => {
              const widgets = this.state.widgets.filter(n => n !== widgetId);
              this.setState({widgets: widgets});

              if (widgetId.match(/\w+:[\w\-]+/)) {
                // Remove forked widget settings
                store.unset(`widgets["${widgetId}"]`);
              }

              this.props.onRemoveWidget(widgetId);
            }, onClose)}
          >
            {i18n._('OK')}
          </Button>
        </Modal.Footer>
      </Modal>
    ));
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
    store.replace('workspace.container.primary.widgets', widgets);
  }

  subscribe() {
    {
      // updatePrimaryWidgets
      const token = pubsub.subscribe('updatePrimaryWidgets', (msg, widgets) => {
        this.setState({widgets: widgets});
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

  expandAll() {
    const len = this.state.widgets.length;
    for (let i = 0; i < len; ++i) {
      const widget = this.widgetMap[this.state.widgets[i]];
      const expand = get(widget, 'expand');
      if (typeof expand === 'function') {
        expand();
      }
    }
  }

  collapseAll() {
    const len = this.state.widgets.length;
    for (let i = 0; i < len; ++i) {
      const widget = this.widgetMap[this.state.widgets[i]];
      const collapse = get(widget, 'collapse');
      if (typeof collapse === 'function') {
        collapse();
      }
    }
  }

  render() {
    const widgets = this.state.widgets
      .filter(widgetId => {
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
      })
      .map(widgetId => (
        <div data-widget-id={widgetId} key={widgetId}>
          <Widget
            ref={node => {
              if (node && node.widget) {
                this.widgetMap[widgetId] = node.widget;
              }
            }}
            widgetId={widgetId}
            onRemove={this.removeWidget(widgetId)}
          />
        </div>
      ));

    return <Fragment>{widgets}</Fragment>;
  }
}

export default PrimaryWidgets;
