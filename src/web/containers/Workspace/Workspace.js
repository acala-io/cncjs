/* eslint-disable react/forbid-foreign-prop-types, react/no-find-dom-node */

import classcat from 'classcat';
import Dropzone from 'react-dropzone';
import ensureArray from 'ensure-array';
import PropTypes from 'prop-types';
import pubsub from 'pubsub-js';
import React, {Fragment, PureComponent} from 'react';
import {connect} from 'react-redux';
import {difference, includes, pick, pullAll, size, throttle} from 'lodash';
import {withRouter} from 'react-router-dom';

import * as dialogActions from '../../dialogs/actions';

import api from '../../api';
import controller from '../../lib/controller';
import i18n from '../../lib/i18n';
import log from '../../lib/log';

import store from '../../store_old';

import * as widgetManager from './WidgetManager';
import DefaultWidgets from './DefaultWidgets';
import PrimaryWidgets from './PrimaryWidgets';
import SecondaryWidgets from './SecondaryWidgets';

import FeederPaused from './modals/FeederPaused';
import FeederWait from './modals/FeederWait';
// import ServerDisconnectedModal from './modals/ServerDisconnected';

import {MODAL_NONE, MODAL_FEEDER_PAUSED, MODAL_FEEDER_WAIT, MODAL_SERVER_DISCONNECTED} from './constants';
import {WORKFLOW_STATE_IDLE} from '../../constants';

import './index.scss';

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
    hideModals: PropTypes.func,
    showServerDisconnectedModal: PropTypes.func,
  };

  state = this.getInitialState();

  getInitialState() {
    return {
      connection: {
        ident: controller.connection.ident,
      },
      inactiveCount: size(widgetManager.getInactiveWidgets()),
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

  render() {
    const {className, style} = this.props;
    const {connection, isDraggingFile, isDraggingWidget, showPrimaryContainer, showSecondaryContainer} = this.state;
    const hidePrimaryContainer = !showPrimaryContainer;
    const hideSecondaryContainer = !showSecondaryContainer;

    return (
      <div style={style} className={classcat([className, 'workspace'])}>
        {this.modals}
        <div className={classcat(['dropzone-overlay', {['hidden']: !(connection.ident && isDraggingFile)}])}>
          <div className="text-block">{i18n._('Drop G-code file here')}</div>
        </div>
        <Dropzone
          className="dropzone"
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
              this.setState({
                isDraggingFile: true,
              });
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
          onDrop={acceptedFiles => {
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
          <div className={'workspace-table'}>
            <div className={'workspace-table-row'}>
              <div
                ref={ref => (this.primaryContainer = ref)}
                className={classcat(['primary-container', {hidden: hidePrimaryContainer}])}
              >
                {this.primaryWidgetsComponent}
              </div>
              {this.defaultWidgetsComponent}
              <div
                ref={ref => (this.secondaryContainer = ref)}
                className={classcat(['secondary-container', {hidden: hideSecondaryContainer}])}
              >
                {this.secondaryWidgetsComponent}
              </div>
            </div>
          </div>
        </Dropzone>
      </div>
    );
  }

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
      this.setState({
        modal: {
          name: MODAL_NONE,
          params: {},
        },
      });
    },
    openModal: (name = MODAL_NONE, params = {}) => {
      this.setState({
        modal: {
          name,
          params,
        },
      });
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
        this.props.hideModals();
      } else {
        this.props.showServerDisconnectedModal();
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
          ident,
        },
      }));
    },
    'connection:close': () => {
      const initialState = this.getInitialState();
      this.setState({...initialState});
    },
    'feeder:status': status => {
      const {modal} = this.state;
      const {hold, holdReason} = {...status};

      if (!hold) {
        if (includes([MODAL_FEEDER_PAUSED, MODAL_FEEDER_WAIT], modal.name)) {
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
        title,
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
    onForkWidget: () => {
      // TODO
    },
    onRemoveWidget: () => {
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
    // const primaryContainer = ReactDOM.findDOMNode(this.primaryContainer);
    // const secondaryContainer = ReactDOM.findDOMNode(this.secondaryContainer);
    // const primaryToggler = ReactDOM.findDOMNode(this.primaryToggler);
    // const secondaryToggler = ReactDOM.findDOMNode(this.secondaryToggler);
    // const defaultContainer = ReactDOM.findDOMNode(this.defaultContainer);
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

      log.debug('FileReader:', pick(file, ['lastModified', 'lastModifiedDate', 'meta', 'name', 'size', 'type']));

      startWaiting();
      this.setState({isUploading: true});

      const ident = connection.ident;
      const name = file.name;
      const gcode = result;

      api
        .loadGCode({gcode, ident, name})
        .then(() => {
          // TODO
        })
        .catch(() => {
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

        return includes(activeWidgets, name);
      });

      const defaultWidgets = store.get('workspace.container.default.widgets');
      const sortableWidgets = difference(widgets, defaultWidgets);
      let primaryWidgets = store.get('workspace.container.primary.widgets');
      let secondaryWidgets = store.get('workspace.container.secondary.widgets');

      primaryWidgets = sortableWidgets.slice();
      pullAll(primaryWidgets, secondaryWidgets);
      pubsub.publish('updatePrimaryWidgets', primaryWidgets);

      secondaryWidgets = sortableWidgets.slice();
      pullAll(secondaryWidgets, primaryWidgets);
      pubsub.publish('updateSecondaryWidgets', secondaryWidgets);

      this.setState({
        inactiveCount: size(inactiveWidgets),
      });
    });
  };

  updateWidgetsForSecondaryContainer = () => {
    widgetManager.show((activeWidgets, inactiveWidgets) => {
      const widgets = Object.keys(store.get('widgets', {})).filter(widgetId => {
        // e.g. "webcam" or "webcam:d8e6352f-80a9-475f-a4f5-3e9197a48a23"
        const name = widgetId.split(':')[0];

        return includes(activeWidgets, name);
      });

      const defaultWidgets = store.get('workspace.container.default.widgets');
      const sortableWidgets = difference(widgets, defaultWidgets);
      let primaryWidgets = store.get('workspace.container.primary.widgets');
      let secondaryWidgets = store.get('workspace.container.secondary.widgets');

      secondaryWidgets = sortableWidgets.slice();
      pullAll(secondaryWidgets, primaryWidgets);
      pubsub.publish('updateSecondaryWidgets', secondaryWidgets);

      primaryWidgets = sortableWidgets.slice();
      pullAll(primaryWidgets, secondaryWidgets);
      pubsub.publish('updatePrimaryWidgets', primaryWidgets);

      this.setState({
        inactiveCount: size(inactiveWidgets),
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

  get modals() {
    const {modal} = this.state;
    const modalName = modal.name;
    const {title} = modal.params;
    const onClose = this.action.closeModal;

    return (
      <Fragment>
        {modalName === MODAL_FEEDER_PAUSED && <FeederPaused title={title} onClose={onClose} />}
        {modalName === MODAL_FEEDER_WAIT && <FeederWait title={title} onClose={onClose} />}
        {/* modalName === MODAL_SERVER_DISCONNECTED && <ServerDisconnectedModal /> */}
      </Fragment>
    );
  }

  get defaultWidgetsComponent() {
    const defaultWidgets = ensureArray(store.get('workspace.container.default.widgets'));

    return (
      <div ref={ref => (this.defaultContainer = ref)} className="default-container">
        <DefaultWidgets defaultWidgets={defaultWidgets} />
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
    this.onResizeThrottled = throttle(this.resizeDefaultContainer, 50);
    window.addEventListener('resize', this.onResizeThrottled);
  }

  removeResizeEventListener() {
    window.removeEventListener('resize', this.onResizeThrottled);
    this.onResizeThrottled = null;
  }
}

const mapStateToProps = () => {
  return {};
};

const mapDispatchToProps = dispatch => ({
  hideModals: () => {
    dispatch(dialogActions.hide());
  },
  showServerDisconnectedModal: () => {
    dispatch(
      dialogActions.alert({
        buttonText: i18n._('Reload Page'),
        heading: i18n._('Server has stopped working'),
        onClose: window.location.reload(true),
        text: i18n._(
          'A problem caused the server to stop working correctly. Check out the server status and try again.'
        ),
      })
    );
  },
});

export default withRouter(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(Workspace)
);
