import ensureArray from 'ensure-array';
import PropTypes from 'prop-types';
import React, {PureComponent} from 'react';
import styled from 'styled-components';
import {connect} from 'react-redux';
import {includes} from 'lodash';

import i18n from '../../lib/i18n';

import * as dialogActions from '../../dialogs/actions';

import {WORKFLOW_STATE_IDLE, WORKFLOW_STATE_PAUSED} from '../../constants';

import ActionLink from '../../components_new/ActionLink';
import AddMacroModal from './AddMacroModal';
import EditMacroModal from './EditMacroModal';
import LoadMacroModal from './LoadMacroModal';

import './index.scss';

const MacroName = styled(ActionLink)`
  width: 100%;
`;

class Macro extends PureComponent {
  static propTypes = {
    actions: PropTypes.object,
    // showAddMacroModal: PropTypes.func,
    showEditMacroModal: PropTypes.func,
    showLoadMacroModal: PropTypes.func,
    state: PropTypes.object,
  };

  handleRunMacro = macro => () => {
    this.props.actions.openRunMacroModal(macro.id);
  };

  render() {
    const {showEditMacroModal, showLoadMacroModal, state} = this.props;
    const {canClick, macros = [], workflow} = state;

    const canRunMacro = canClick && includes([WORKFLOW_STATE_IDLE, WORKFLOW_STATE_PAUSED], workflow.state);
    const canLoadMacro = true; // canClick && includes([WORKFLOW_STATE_IDLE], workflow.state);

    return (
      <table className="table table--form table--row-hovers table--scrollable">
        <tbody>
          {macros.length === 0 && (
            <tr>
              <td colSpan="2">
                <div className="empty-result">{i18n._('No macros')}</div>
              </td>
            </tr>
          )}
          {ensureArray(macros).map(macro => (
            <tr key={macro.id}>
              <td>
                <MacroName
                  action="run"
                  onClick={this.handleRunMacro(macro)}
                  label={macro.name}
                  isDisabled={!canRunMacro}
                  renderWithLabel
                />
              </td>
              <td style={{width: '1%'}}>
                <div className="nowrap">
                  <ActionLink action="download" onClick={() => showLoadMacroModal(macro)} isDisabled={!canLoadMacro} />
                  <ActionLink action="edit" onClick={() => showEditMacroModal(macro)} />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  }
}

const mapStateToProps = (state, ownProps) => ({
  ...ownProps,
  ...state,
});

const mapDispatchToProps = (dispatch, state) => ({
  hideModals: () => {
    dispatch(dialogActions.hide());
  },
  showAddMacroModal: () => {
    const modalProps = {
      // onClose: dispatch(dialogActions.hide()),
    };

    dispatch(dialogActions.show(AddMacroModal, modalProps));
  },
  showEditMacroModal: macro => {
    const macroDetails = state.actions.getMacroDetails(macro.id);

    const modalProps = {
      deleteMacro: state.actions.deleteMacro,
      macro: macroDetails,
      onClose: dispatch(dialogActions.hide()),
      updateMacro: state.actions.updateMacro,
      updateModalParams: state.actions.updateModalParams,
    };

    dispatch(dialogActions.show(EditMacroModal, modalProps));
  },
  showLoadMacroModal: macro => {
    const modalProps = {
      id: macro.id,
      loadMacro: state.actions.loadMacro,
      name: macro.name,
      onClose: dispatch(dialogActions.hide()),
    };

    dispatch(dialogActions.show(LoadMacroModal, modalProps));
  },
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Macro);
