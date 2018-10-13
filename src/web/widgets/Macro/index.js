import classcat from 'classcat';
import includes from 'lodash/includes';
import PropTypes from 'prop-types';
import React, {PureComponent} from 'react';

import api from '../../api';
import i18n from '../../lib/i18n';
import log from '../../lib/log';
import controller from '../../lib/controller';

import {
  // Controller
  GRBL,
  GRBL_MACHINE_STATE_IDLE,
  GRBL_MACHINE_STATE_RUN,
  MARLIN,
  SMOOTHIE,
  SMOOTHIE_MACHINE_STATE_IDLE,
  SMOOTHIE_MACHINE_STATE_RUN,
  TINYG,
  TINYG_MACHINE_STATE_READY,
  TINYG_MACHINE_STATE_STOP,
  TINYG_MACHINE_STATE_END,
  TINYG_MACHINE_STATE_RUN,
  // Workflow
  WORKFLOW_STATE_RUNNING,
} from '../../constants';
import {MODAL_NONE, MODAL_ADD_MACRO, MODAL_EDIT_MACRO, MODAL_RUN_MACRO} from './constants';

import AddMacro from './AddMacro';
import EditMacro from './EditMacro';
import Macro from './Macro';
import RunMacro from './RunMacro';
import Space from '../../components/Space';
import Widget from '../../components/Widget';
import WidgetConfig from '../WidgetConfig';

import styles from './index.styl';

class MacroWidget extends PureComponent {
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
    const {state, type} = controller;

    return {
      connection: {
        ident: controller.connection.ident,
      },
      controller: {
        state,
        type,
      },
      macros: [],
      minimized: this.config.get('minimized', false),
      modal: {
        name: MODAL_NONE,
        params: {},
      },
      workflow: {
        state: controller.workflow.state,
      },
    };
  }

  render() {
    const {widgetId} = this.props;
    const {minimized} = this.state;
    const state = {
      ...this.state,
      canClick: this.canClick(),
    };
    const actions = {...this.actions};

    return (
      <Widget>
        <Widget.Header>
          <Widget.Title>{i18n._('Macro')}</Widget.Title>
          <Widget.Controls>
            {minimized ? null : (
              <Widget.Button title={i18n._('New Macro')} onClick={actions.openAddMacroModal}>
                <i className="fa fa-plus" />
              </Widget.Button>
            )}
            <Widget.Button title={minimized ? i18n._('Expand') : i18n._('Collapse')} onClick={actions.toggleMinimized}>
              <i className={classcat(['fa', {'fa-chevron-up': !minimized}, {'fa-chevron-down': minimized}])} />
            </Widget.Button>
          </Widget.Controls>
        </Widget.Header>
        <Widget.Content className={classcat([styles['widget-content'], {[styles.hidden]: minimized}])}>
          {state.modal.name === MODAL_ADD_MACRO && <AddMacro state={state} actions={actions} />}
          {state.modal.name === MODAL_EDIT_MACRO && <EditMacro state={state} actions={actions} />}
          {state.modal.name === MODAL_RUN_MACRO && <RunMacro state={state} actions={actions} />}
          <Macro state={state} actions={actions} />
        </Widget.Content>
      </Widget>
    );
  }

  actions = {
    openModal: (name = MODAL_NONE, params = {}) => {
      this.setState({
        modal: {
          name: name,
          params: params,
        },
      });
    },
    closeModal: () => {
      this.setState({
        modal: {
          name: MODAL_NONE,
          params: {},
        },
      });
    },
    updateModalParams: (params = {}) => {
      this.setState({
        modal: {
          ...this.state.modal,
          params: {
            ...this.state.modal.params,
            ...params,
          },
        },
      });
    },
    addMacro: async ({name, content}) => {
      try {
        let res;
        res = await api.macros.create({content, name});
        res = await api.macros.fetch();
        const {records: macros} = res.body;
        this.setState({macros: macros});
      } catch (err) {
        // Ignore error
      }
    },
    deleteMacro: async id => {
      try {
        let res;
        res = await api.macros.delete(id);
        res = await api.macros.fetch();
        const {records: macros} = res.body;

        this.setState({macros});
      } catch (err) {
        // Ignore error
      }
    },
    updateMacro: async (id, {name, content}) => {
      try {
        let res;
        res = await api.macros.update(id, {content, name});
        res = await api.macros.fetch();
        const {records: macros} = res.body;

        this.setState({macros});
      } catch (err) {
        // Ignore error
      }
    },
    runMacro: (id, {name}) => {
      controller.command('macro:run', id, controller.context, (err, data) => {
        if (err) {
          log.error(`Failed to run the macro: id=${id}, name="${name}"`);
          return;
        }
      });
    },
    loadMacro: async (id, {name}) => {
      try {
        const res = await api.macros.read(id);
        const {name} = res.body;
        controller.command('macro:load', id, controller.context, (err, data) => {
          if (err) {
            log.error(`Failed to load the macro: id=${id}, name="${name}"`);
            return;
          }

          log.debug(data); // TODO
        });
      } catch (err) {
        // Ignore error
      }
    },
    openAddMacroModal: () => {
      this.actions.openModal(MODAL_ADD_MACRO);
    },
    openEditMacroModal: id => {
      api.macros.read(id).then(res => {
        const {content, id, name} = res.body;

        this.actions.openModal(MODAL_EDIT_MACRO, {content, id, name});
      });
    },
    openRunMacroModal: id => {
      api.macros.read(id).then(res => {
        const {content, id, name} = res.body;

        this.actions.openModal(MODAL_RUN_MACRO, {content, id, name});
      });
    },
    toggleMinimized: () => {
      const {minimized} = this.state;
      this.setState({minimized: !minimized});
    },
  };

  controllerEvents = {
    'config:change': () => {
      this.fetchMacros();
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
      this.setState(state => ({
        ...initialState,
        macros: [...state.macros],
      }));
    },
    'controller:state': (type, controllerState) => {
      this.setState(state => ({
        controller: {
          ...state.controller,
          type,
          state: controllerState,
        },
      }));
    },
    'workflow:state': workflowState => {
      this.setState(state => ({
        workflow: {
          state: workflowState,
        },
      }));
    },
  };

  fetchMacros = async () => {
    try {
      const res = await api.macros.fetch();
      const {records: macros} = res.body;

      this.setState({macros});
    } catch (err) {
      // Ignore error
    }
  };

  componentDidMount() {
    this.fetchMacros();
    this.addControllerEvents();
  }

  componentWillUnmount() {
    this.removeControllerEvents();
  }

  componentDidUpdate(prevProps, prevState) {
    const {minimized} = this.state;

    this.config.set('minimized', minimized);
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

  canClick() {
    const machineState = controller.getMachineState();

    if (!controller.connection.ident) {
      return false;
    }

    if (controller.type === GRBL && !includes([GRBL_MACHINE_STATE_IDLE, GRBL_MACHINE_STATE_RUN], machineState)) {
      return false;
    }

    if (controller.type === MARLIN) {
      // Marlin does not have machine state
    }

    if (
      controller.type === SMOOTHIE &&
      !includes([SMOOTHIE_MACHINE_STATE_IDLE, SMOOTHIE_MACHINE_STATE_RUN], machineState)
    ) {
      return false;
    }

    if (
      controller.type === TINYG &&
      !includes(
        [TINYG_MACHINE_STATE_READY, TINYG_MACHINE_STATE_STOP, TINYG_MACHINE_STATE_END, TINYG_MACHINE_STATE_RUN],
        machineState
      )
    ) {
      return false;
    }

    if (controller.workflow.state === WORKFLOW_STATE_RUNNING) {
      return false;
    }

    return true;
  }
}

export default MacroWidget;
