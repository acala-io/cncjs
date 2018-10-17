import classcat from 'classcat';
import PropTypes from 'prop-types';
import React, {PureComponent} from 'react';
import {includes} from 'lodash';

import api from '../../api';
import controller from '../../lib/controller';
import i18n from '../../lib/i18n';
import log from '../../lib/log';

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

import ActionLink from '../../components_new/ActionLink';
import AddMacro from './AddMacro';
import Card, {CardHeader} from '../../components_new/Card';
import EditMacro from './EditMacro';
import Macro from './Macro';
import Padding from '../../components_new/Padding';
import RunMacro from './RunMacro';
import WidgetConfig from '../WidgetConfig';

import './index.scss';

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
    const {minimized} = this.state;

    const state = {
      ...this.state,
      canClick: this.canClick(),
    };

    const actions = {...this.actions};

    return (
      <Card noPad shadow>
        <CardHeader>
          {minimized ? null : <ActionLink action="add" className="right" onClick={actions.openAddMacroModal} />}
          <h3 onMouseDown={actions.toggleMinimized}>{i18n._('Macro')}</h3>
        </CardHeader>
        <div className={classcat([{hidden: minimized}])}>
          <Padding>
            {state.modal.name === MODAL_ADD_MACRO && <AddMacro state={state} actions={actions} />}
            {state.modal.name === MODAL_EDIT_MACRO && <EditMacro state={state} actions={actions} />}
            {state.modal.name === MODAL_RUN_MACRO && <RunMacro state={state} actions={actions} />}
            <Macro state={state} actions={actions} />
          </Padding>
        </div>
      </Card>
    );
  }

  actions = {
    openModal: (name = MODAL_NONE, params = {}) => {
      this.setState({
        modal: {
          name,
          params,
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
        this.setState({macros});
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
      controller.command('macro:run', id, controller.context, err => {
        if (err) {
          log.error(`Failed to run the macro: id=${id}, name="${name}"`);
          return;
        }
      });
    },
    loadMacro: async id => {
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
      this.setState({
        minimized: !this.state.minimized,
      });
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
          ident,
        },
      }));
    },
    'connection:close': () => {
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
          state: controllerState,
          type,
        },
      }));
    },
    'workflow:state': workflowState => {
      this.setState(() => ({
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

  componentDidUpdate() {
    this.config.set('minimized', this.state.minimized);
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
