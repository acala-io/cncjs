/* eslint-disable react/forbid-foreign-prop-types, react/no-find-dom-node */

import _ from 'lodash';
import classcat from 'classcat';
import ensureArray from 'ensure-array';
import Dropzone from 'react-dropzone';
import pubsub from 'pubsub-js';
import React, {Fragment, PureComponent} from 'react';
import ReactDOM from 'react-dom';
import {withRouter} from 'react-router-dom';

import api from '../../api';
import controller from '../../lib/controller';
import i18n from '../../lib/i18n';
import log from '../../lib/log';

import store from '../../store_old';

import * as widgetManager from './WidgetManager';
import DefaultWidgets from './DefaultWidgets';
import PrimaryWidgets from './PrimaryWidgets';
import SecondaryWidgets from './SecondaryWidgets';
import {Button, ButtonGroup, ButtonToolbar} from '../../components/Buttons';

import FeederPaused from './modals/FeederPaused';
import FeederWait from './modals/FeederWait';
import ServerDisconnected from './modals/ServerDisconnected';

import {MODAL_NONE, MODAL_FEEDER_PAUSED, MODAL_FEEDER_WAIT, MODAL_SERVER_DISCONNECTED} from './constants';
import {WORKFLOW_STATE_IDLE} from '../../constants';

import styles from './index.styl';

const WAIT = '%wait';

const startWaiting = () => {
  // Adds the 'wait' class to <html>
  const root = document.documentElement;
  root.classList.add('wait');
};

const stopWaiting = () => {
  // Adds the 'wait' class to <html>
  const root = document.documentElement;
  root.classList.remove('wait');
};

class Workspace extends PureComponent {
  static propTypes = {
    ...withRouter.propTypes,
  };

  state = this.getInitialState();

  sortableGroup = {
    primary: null,
    secondary: null,
  };
  primaryContainer = null;
  secondaryContainer = null;
  primaryToggler = null;
  secondaryToggler = null;
  primaryWidgets = null;
  secondaryWidgets = null;
  defaultContainer = null;

  action = {
    closeModal: () => {
      this.setState(state => ({
        modal: {
          name: MODAL_NONE,
          params: {},
        },
      }));
    },
    openModal: (name = MODAL_NONE, params = {}) => {
      this.setState(state => ({
        modal: {
          name,
          params,
        },
      }));
    },
    updateModalParams: (params = {}) => {
      this.setState(state => ({
        modal: {
          ...state.modal,
          params: {
            ...state.modal.params,
            ...params,
          },
        },
      }));
    },
  };

  controllerEvents = {
    connect: () => {
      if (controller.connected) {
        this.action.closeModal();
      } else {
        this.action.openModal(MODAL_SERVER_DISCONNECTED);
      }
    },
    connect_error: () => {
      if (controller.connected) {
        this.action.closeModal();
      } else {
        this.action.openModal(MODAL_SERVER_DISCONNECTED);
      }
    },
    disconnect: () => {
      if (controller.connected) {
        this.action.closeModal();
      } else {
        this.action.openModal(MODAL_SERVER_DISCONNECTED);
      }
    },
    'connection:open': options => {
      const {ident} = options;

      this.setState(state => ({
        connection: {
          ...state.connection,
          ident: ident,
        },
      }));
    },
    'connection:close': options => {
      const initialState = this.getInitialState();
      this.setState({...initialState});
    },
    'feeder:status': status => {
      const {modal} = this.state;
      const {hold, holdReason} = {...status};

      if (!hold) {
        if (_.includes([MODAL_FEEDER_PAUSED, MODAL_FEEDER_WAIT], modal.name)) {
          this.action.closeModal();
        }
        return;
      }

      const {data, err} = {...holdReason};

      if (err) {
        this.action.openModal(MODAL_FEEDER_PAUSED, {
          title: i18n._('Error'),
        });
        return;
      }

      if (data === WAIT) {
        this.action.openModal(MODAL_FEEDER_WAIT, {
          title: '%wait',
        });
        return;
      }

      const title =
        {
          M0: i18n._('M0 Program Pause'),
          M1: i18n._('M1 Program Pause'),
          M2: i18n._('M2 Program End'),
          M30: i18n._('M30 Program End'),
          M6: i18n._('M6 Tool Change'),
          M109: i18n._('M109 Set Extruder Temperature'),
          M190: i18n._('M190 Set Heated Bed Temperature'),
        }[data] || data;

      this.action.openModal(MODAL_FEEDER_PAUSED, {
        title: title,
      });
    },
  };
  widgetEventHandler = {
    onDragEnd: () => {
      const {isDraggingWidget} = this.state;

      if (isDraggingWidget) {
        this.setState({
          isDraggingWidget: false,
        });
      }
    },
    onDragStart: () => {
      const {isDraggingWidget} = this.state;

      if (!isDraggingWidget) {
        this.setState({
          isDraggingWidget: true,
        });
      }
    },
    onForkWidget: widgetId => {
      // TODO
    },
    onRemoveWidget: widgetId => {
      const inactiveWidgets = widgetManager.getInactiveWidgets();
      this.setState({
        inactiveCount: inactiveWidgets.length,
      });
    },
  };

  togglePrimaryContainer = () => {
    this.setState({
      showPrimaryContainer: !this.state.showPrimaryContainer,
    });

    pubsub.publish('resize');
  };

  toggleSecondaryContainer = () => {
    this.setState({
      showSecondaryContainer: !this.state.showSecondaryContainer,
    });

    pubsub.publish('resize');
  };

  resizeDefaultContainer = () => {
    const sidebar = document.querySelector('#sidebar');
    const primaryContainer = ReactDOM.findDOMNode(this.primaryContainer);
    const secondaryContainer = ReactDOM.findDOMNode(this.secondaryContainer);
    const primaryToggler = ReactDOM.findDOMNode(this.primaryToggler);
    const secondaryToggler = ReactDOM.findDOMNode(this.secondaryToggler);
    const defaultContainer = ReactDOM.findDOMNode(this.defaultContainer);
    const {showPrimaryContainer, showSecondaryContainer} = this.state;

    {
      // Mobile-Friendly View
      const {location} = this.props;
      const disableHorizontalScroll = !(showPrimaryContainer && showSecondaryContainer);

      if (location.pathname === '/workspace' && disableHorizontalScroll) {
        // Disable horizontal scroll
        document.body.scrollLeft = 0;
        document.body.style.overflowX = 'hidden';
      } else {
        // Enable horizontal scroll
        document.body.style.overflowX = '';
      }
    }

    // if (showPrimaryContainer) {
    //   defaultContainer.style.left = primaryContainer.offsetWidth + sidebar.offsetWidth + 'px';
    // } else {
    //   defaultContainer.style.left = primaryToggler.offsetWidth + sidebar.offsetWidth + 'px';
    // }

    // if (showSecondaryContainer) {
    //   defaultContainer.style.right = secondaryContainer.offsetWidth + 'px';
    // } else {
    //   defaultContainer.style.right = secondaryToggler.offsetWidth + 'px';
    // }

    pubsub.publish('resize'); // Also see "widgets/Visualizer"
  };

  onDrop = files => {
    const {connection} = this.state;

    if (!connection.ident) {
      return;
    }

    const file = files[0];
    const reader = new FileReader();

    reader.onloadend = event => {
      const {result, error} = event.target;

      if (error) {
        log.error(error);
        return;
      }

      log.debug('FileReader:', _.pick(file, ['lastModified', 'lastModifiedDate', 'meta', 'name', 'size', 'type']));

      startWaiting();
      this.setState({isUploading: true});

      const ident = connection.ident;
      const name = file.name;
      const gcode = result;

      api
        .loadGCode({gcode, ident, name})
        .then(res => {
          // TODO
        })
        .catch(res => {
          log.error('Failed to upload G-code file');
        })
        .then(() => {
          stopWaiting();
          this.setState({
            isUploading: false,
          });
        });
    };

    try {
      reader.readAsText(file);
    } catch (err) {
      // Ignore error
    }
  };

  updateWidgetsForPrimaryContainer = () => {
    widgetManager.show((activeWidgets, inactiveWidgets) => {
      const widgets = Object.keys(store.get('widgets', {})).filter(widgetId => {
        // e.g. "webcam" or "webcam:d8e6352f-80a9-475f-a4f5-3e9197a48a23"
        const name = widgetId.split(':')[0];

        return _.includes(activeWidgets, name);
      });

      const defaultWidgets = store.get('workspace.container.default.widgets');
      const sortableWidgets = _.difference(widgets, defaultWidgets);
      let primaryWidgets = store.get('workspace.container.primary.widgets');
      let secondaryWidgets = store.get('workspace.container.secondary.widgets');

      primaryWidgets = sortableWidgets.slice();
      _.pullAll(primaryWidgets, secondaryWidgets);
      pubsub.publish('updatePrimaryWidgets', primaryWidgets);

      secondaryWidgets = sortableWidgets.slice();
      _.pullAll(secondaryWidgets, primaryWidgets);
      pubsub.publish('updateSecondaryWidgets', secondaryWidgets);

      this.setState({
        inactiveCount: _.size(inactiveWidgets),
      });
    });
  };

  updateWidgetsForSecondaryContainer = () => {
    widgetManager.show((activeWidgets, inactiveWidgets) => {
      const widgets = Object.keys(store.get('widgets', {})).filter(widgetId => {
        // e.g. "webcam" or "webcam:d8e6352f-80a9-475f-a4f5-3e9197a48a23"
        const name = widgetId.split(':')[0];

        return _.includes(activeWidgets, name);
      });

      const defaultWidgets = store.get('workspace.container.default.widgets');
      const sortableWidgets = _.difference(widgets, defaultWidgets);
      let primaryWidgets = store.get('workspace.container.primary.widgets');
      let secondaryWidgets = store.get('workspace.container.secondary.widgets');

      secondaryWidgets = sortableWidgets.slice();
      _.pullAll(secondaryWidgets, primaryWidgets);
      pubsub.publish('updateSecondaryWidgets', secondaryWidgets);

      primaryWidgets = sortableWidgets.slice();
      _.pullAll(primaryWidgets, secondaryWidgets);
      pubsub.publish('updatePrimaryWidgets', primaryWidgets);

      this.setState({
        inactiveCount: _.size(inactiveWidgets),
      });
    });
  };

  componentDidMount() {
    this.addControllerEvents();
    this.addResizeEventListener();

    setTimeout(() => {
      // A workaround solution to trigger componentDidUpdate on initial render
      this.setState({
        mounted: true,
      });
    }, 0);
  }

  componentWillUnmount() {
    this.removeControllerEvents();
    this.removeResizeEventListener();
  }

  componentDidUpdate() {
    store.set('workspace.container.primary.show', this.state.showPrimaryContainer);
    store.set('workspace.container.secondary.show', this.state.showSecondaryContainer);

    this.resizeDefaultContainer();
  }

  getInitialState() {
    return {
      connection: {
        ident: controller.connection.ident,
      },
      inactiveCount: _.size(widgetManager.getInactiveWidgets()),
      isDraggingFile: false,
      isDraggingWidget: false,
      isUploading: false,
      modal: {
        name: MODAL_NONE,
        params: {},
      },
      mounted: false,
      showPrimaryContainer: store.get('workspace.container.primary.show'),
      showSecondaryContainer: store.get('workspace.container.secondary.show'),
    };
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

  addResizeEventListener() {
    this.onResizeThrottled = _.throttle(this.resizeDefaultContainer, 50);
    window.addEventListener('resize', this.onResizeThrottled);
  }

  removeResizeEventListener() {
    window.removeEventListener('resize', this.onResizeThrottled);
    this.onResizeThrottled = null;
  }

  render() {
    const {className, style} = this.props;
    const {connection, isDraggingFile, isDraggingWidget, showPrimaryContainer, showSecondaryContainer} = this.state;
    const hidePrimaryContainer = !showPrimaryContainer;
    const hideSecondaryContainer = !showSecondaryContainer;

    return (
      <div style={style} className={classcat([className, styles.workspace])}>
        {this.modals}
        <div className={classcat([styles.dropzoneOverlay, {[styles.hidden]: !(connection.ident && isDraggingFile)}])}>
          <div className={styles.textBlock}>{i18n._('Drop G-code file here')}</div>
        </div>
        <Dropzone
          className={styles.dropzone}
          disabled={controller.workflow.state !== WORKFLOW_STATE_IDLE}
          multiple={false}
          onDragStart={() => {}}
          onDragEnter={() => {
            if (controller.workflow.state !== WORKFLOW_STATE_IDLE) {
              return;
            }

            if (isDraggingWidget) {
              return;
            }

            if (!isDraggingFile) {
              this.setState({isDraggingFile: true});
            }
          }}
          onDragLeave={() => {
            if (controller.workflow.state !== WORKFLOW_STATE_IDLE) {
              return;
            }

            if (isDraggingWidget) {
              return;
            }

            if (isDraggingFile) {
              this.setState({
                isDraggingFile: false,
              });
            }
          }}
          onDrop={(acceptedFiles, rejectedFiles) => {
            if (controller.workflow.state !== WORKFLOW_STATE_IDLE) {
              return;
            }

            if (isDraggingWidget) {
              return;
            }

            if (isDraggingFile) {
              this.setState({
                isDraggingFile: false,
              });
            }

            this.onDrop(acceptedFiles);
          }}
          disableClick
          disablePreview
        >
          <div className={styles.workspaceTable}>
            <div className={styles.workspaceTableRow}>
              <div
                ref={ref => (this.primaryContainer = ref)}
                className={classcat([styles.primaryContainer, {[styles.hidden]: hidePrimaryContainer}])}
              >
                {/* this.manageContainerContent('primary') */}
                {this.primaryWidgetsComponent}
              </div>
              {/* this.primaryContainerToggle */}
              {this.defaultWidgetsComponent}
              {/* this.secondaryContainerToggle */}
              <div
                ref={ref => (this.secondaryContainer = ref)}
                className={classcat([styles.secondaryContainer, {[styles.hidden]: hideSecondaryContainer}])}
              >
                {/* this.manageContainerContent('secondary') */}
                {this.secondaryWidgetsComponent}
              </div>
            </div>
          </div>
        </Dropzone>
      </div>
    );
  }

  get modals() {
    const {modal} = this.state;
    const modalName = modal.name;
    const {title} = modal.params;
    const onClose = this.action.closeModal;

    return (
      <Fragment>
        {modalName === MODAL_FEEDER_PAUSED && <FeederPaused title={title} onClose={onClose} />}
        {modalName === MODAL_FEEDER_WAIT && <FeederWait title={title} onClose={onClose} />}
        {modalName === MODAL_SERVER_DISCONNECTED && <ServerDisconnected />}
      </Fragment>
    );
  }

  get defaultWidgetsComponent() {
    const defaultWidgets = ensureArray(store.get('workspace.container.default.widgets'));

    return (
      <div ref={ref => (this.defaultContainer = ref)} className={classcat([styles.defaultContainer, styles.fixed])}>
        <DefaultWidgets defaultWidgets={defaultWidgets} />
      </div>
    );
  }

  get primaryContainerToggle() {
    if (this.state.showPrimaryContainer) {
      return null;
    }

    return (
      <div ref={node => (this.primaryToggler = node)} className={styles.primaryToggler}>
        <ButtonGroup btnSize="sm" btnStyle="flat">
          <Button style={{minWidth: 30}} compact onClick={this.togglePrimaryContainer}>
            <i className="fa fa-chevron-right" />
          </Button>
        </ButtonGroup>
      </div>
    );
  }

  get primaryWidgetsComponent() {
    return (
      <PrimaryWidgets
        ref={node => (this.primaryWidgets = node)}
        onForkWidget={this.widgetEventHandler.onForkWidget}
        onRemoveWidget={this.widgetEventHandler.onRemoveWidget}
        onDragStart={this.widgetEventHandler.onDragStart}
        onDragEnd={this.widgetEventHandler.onDragEnd}
      />
    );
  }

  get secondaryWidgetsComponent() {
    return (
      <SecondaryWidgets
        ref={ref => (this.secondaryWidgets = ref)}
        onForkWidget={this.widgetEventHandler.onForkWidget}
        onRemoveWidget={this.widgetEventHandler.onRemoveWidget}
        onDragStart={this.widgetEventHandler.onDragStart}
        onDragEnd={this.widgetEventHandler.onDragEnd}
      />
    );
  }

  get secondaryContainerToggle() {
    if (this.state.showSecondaryContainer) {
      return null;
    }

    return (
      <div ref={node => (this.secondaryToggler = node)} className={styles.secondaryToggler}>
        <ButtonGroup btnSize="sm" btnStyle="flat">
          <Button style={{minWidth: 30}} compact onClick={this.toggleSecondaryContainer}>
            <i className="fa fa-chevron-right" />
          </Button>
        </ButtonGroup>
      </div>
    );
  }

  manageContainerContent(container = 'primary') {
    const {inactiveCount} = this.state;

    const isSecondary = container === 'secondary';

    const collapseAll = () => {}; // isSecondary ? this.secondaryWidgets.collapseAll : this.primaryWidgets.collapseAll;
    const expandAll = () => {}; // isSecondary ? this.secondaryWidgets.expandAll : this.primaryWidgets.expandAll;
    const updateWidgets = isSecondary ? this.updateWidgetsForSecondaryContainer : this.updateWidgetsForPrimaryContainer;
    const toggleContainer = isSecondary ? this.toggleSecondaryContainer : this.togglePrimaryContainer;

    return (
      <ButtonToolbar style={{margin: '5px 0'}}>
        <div className={classcat([{'pull-left': isSecondary}])}>
          <ButtonGroup style={{marginLeft: 0, marginRight: 10}} btnSize="sm" btnStyle="flat">
            <Button style={{minWidth: 30}} title={i18n._('Collapse All')} onClick={collapseAll} compact>
              <i className="fa fa-chevron-up" style={{fontSize: 14}} />
            </Button>
            <Button style={{minWidth: 30}} title={i18n._('Expand All')} onClick={expandAll} compact>
              <i className="fa fa-chevron-down" style={{fontSize: 14}} />
            </Button>
          </ButtonGroup>
          <ButtonGroup style={{marginLeft: 0, marginRight: 10}} btnSize="sm" btnStyle="flat">
            <Button style={{width: 230}} onClick={updateWidgets}>
              <i className="fa fa-list-alt" />
              {i18n._('Manage Widgets ({{inactiveCount}})', {inactiveCount})}
            </Button>
          </ButtonGroup>
          <ButtonGroup style={{marginLeft: 0, marginRight: 0}} btnSize="sm" btnStyle="flat">
            <Button style={{minWidth: 30}} compact onClick={toggleContainer}>
              <i className="fa fa-chevron-right" />
            </Button>
          </ButtonGroup>
        </div>
      </ButtonToolbar>
    );
  }
}

export default withRouter(Workspace);
