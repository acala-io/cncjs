/* eslint-disable react/no-find-dom-node */

import classcat from 'classcat';
import Dropzone from 'react-dropzone';
import ensureArray from 'ensure-array';
import PropTypes from 'prop-types';
import pubsub from 'pubsub-js';
import React, {Fragment, PureComponent} from 'react';
import styled from 'styled-components';
import {connect} from 'react-redux';
import {includes, pick, throttle} from 'lodash';

import api from '../../api';
import controller from '../../lib/controller';
import i18n from '../../lib/i18n';
import log from '../../lib/log';

import * as dialogActions from '../../dialogs/actions';

import store from '../../store_old';

import {MODAL_NONE, MODAL_FEEDER_PAUSED, MODAL_FEEDER_WAIT} from './constants';
import {WORKFLOW_STATE_IDLE} from '../../constants';

import DefaultWidgets from './DefaultWidgets';
import FeederPausedModal from './FeederPausedModal';
import FeederWaitModal from './FeederWaitModal';
import {Link, LinkIcon} from '../../components_new/Link';
import PrimaryWidgets from './PrimaryWidgets';
import SecondaryWidgets from './SecondaryWidgets';
import ServerDisconnectedModal from './ServerDisconnectedModal';
import SettingsModal from '../../settings/SettingsModal';

import s from '../../styles/variables';
import mixin from '../../styles/mixins';

import './index.scss';

const SettingsLink = styled(Link)`
  ${mixin.pinBottomLeftFixed}

  padding: ${s.size.default};
  width: 100%;
`;

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
    // currentDialog: PropTypes.func,
    editSettings: PropTypes.func,
    hideModals: PropTypes.func,
    // showFeederPausedModal: PropTypes.func,
    // showFeederWaitModal: PropTypes.func,
    showServerDisconnectedModal: PropTypes.func,
  };

  state = this.getInitialState();

  getInitialState() {
    return {
      connection: {
        ident: controller.connection.ident,
      },
      isDraggingFile: false,
      isUploading: false,
      modal: {
        name: MODAL_NONE,
        params: {},
      },
      mounted: false,
    };
  }

  render() {
    const {connection, isDraggingFile} = this.state;

    return (
      <div className="workspace">
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
          <div className="workspace-table">
            <div className="workspace-table-row">
              <div ref={ref => (this.primaryContainer = ref)} className="primary-container">
                {this.primaryWidgetsComponent}
                {this.editSettings}
              </div>
              {this.defaultWidgetsComponent}
              <div ref={ref => (this.secondaryContainer = ref)} className="secondary-container">
                {this.secondaryWidgetsComponent}
              </div>
            </div>
          </div>
        </Dropzone>
      </div>
    );
  }

  get editSettings() {
    return (
      <SettingsLink onClick={this.props.editSettings}>
        <LinkIcon name="settings" />
        {i18n._('Settings')}
      </SettingsLink>
    );
  }

  primaryContainer = null;
  secondaryContainer = null;
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
        this.props.showServerDisconnectedModal();
      }
    },
    disconnect: () => {
      if (controller.connected) {
        this.action.closeModal();
      } else {
        this.props.showServerDisconnectedModal();
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

  resizeDefaultContainer = () => {
    // const primaryContainer = ReactDOM.findDOMNode(this.primaryContainer);
    // const secondaryContainer = ReactDOM.findDOMNode(this.secondaryContainer);
    // const defaultContainer = ReactDOM.findDOMNode(this.defaultContainer);
    // const {showPrimaryContainer, showSecondaryContainer} = this.state;

    // if (showPrimaryContainer) {
    //   defaultContainer.style.left = primaryContainer.offsetWidth + sidebar.offsetWidth + 'px';
    // } else {
    //   defaultContainer.style.left = sidebar.offsetWidth + 'px';
    // }

    // if (showSecondaryContainer) {
    //   defaultContainer.style.right = secondaryContainer.offsetWidth + 'px';
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
      this.setState({
        isUploading: true,
      });

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
    this.resizeDefaultContainer();
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
    return <PrimaryWidgets ref={ref => (this.primaryWidgets = ref)} />;
  }

  get secondaryWidgetsComponent() {
    return <SecondaryWidgets ref={ref => (this.secondaryWidgets = ref)} />;
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

  get modals() {
    const {modal} = this.state;
    const modalName = modal.name;
    const {title} = modal.params;
    const onClose = this.action.closeModal;

    return (
      <Fragment>
        {modalName === MODAL_FEEDER_PAUSED && <FeederPausedModal title={title} onClose={onClose} />}
        {modalName === MODAL_FEEDER_WAIT && <FeederWaitModal title={title} onClose={onClose} />}
      </Fragment>
    );
  }
}

const mapStateToProps = state => {
  const {currentDialog} = state.dialogs;

  return {currentDialog};
};

const mapDispatchToProps = dispatch => ({
  editSettings: () => {
    dispatch(dialogActions.show(SettingsModal, {}));
  },
  hideModals: () => {
    dispatch(dialogActions.hide());
  },
  showFeederPausedModal: () => {
    dispatch(
      dialogActions.show(FeederPausedModal, {
        onClose: () => {}, // TODO
        title: '???', // TODO
      })
    );
  },
  showFeederWaitModal: () => {
    dispatch(
      dialogActions.show(FeederWaitModal, {
        onClose: () => {}, // TODO
        title: '???', // TODO
      })
    );
  },
  showServerDisconnectedModal: () => {
    dispatch(
      dialogActions.show(ServerDisconnectedModal, {
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

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Workspace);
