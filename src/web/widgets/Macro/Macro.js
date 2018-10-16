import chainedFunction from 'chained-function';
import ensureArray from 'ensure-array';
import PropTypes from 'prop-types';
import React, {PureComponent} from 'react';
import {includes} from 'lodash';

import i18n from '../../lib/i18n';
import portal from '../../lib/portal';

import {WORKFLOW_STATE_IDLE, WORKFLOW_STATE_PAUSED} from '../../constants';

import ActionLink from '../../components_new/ActionLink';
import Modal from '../../components/Modal';
import {Button} from '../../components/Buttons';

import './index.scss';

class Macro extends PureComponent {
  static propTypes = {
    actions: PropTypes.object,
    state: PropTypes.object,
  };

  handleRunMacro = macro => () => {
    const {actions} = this.props;
    actions.openRunMacroModal(macro.id);
  };

  handleLoadMacro = macro => () => {
    const {id, name} = macro;

    portal(({onClose}) => (
      <Modal size="xs" onClose={onClose}>
        <Modal.Header>
          <Modal.Title>{i18n._('Load Macro')}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {i18n._('Are you sure you want to load this macro?')}
          <p>
            <strong>{name}</strong>
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={onClose}>{i18n._('No')}</Button>
          <Button
            btnStyle="primary"
            onClick={chainedFunction(() => {
              const {actions} = this.props;
              actions.loadMacro(id, {name});
            }, onClose)}
          >
            {i18n._('Yes')}
          </Button>
        </Modal.Footer>
      </Modal>
    ));
  };

  handleEditMacro = macro => () => {
    this.props.actions.openEditMacroModal(macro.id);
  };

  render() {
    const {state} = this.props;
    const {canClick, workflow, macros = []} = state;

    const canRunMacro = canClick && includes([WORKFLOW_STATE_IDLE, WORKFLOW_STATE_PAUSED], workflow.state);
    const canLoadMacro = canClick && includes([WORKFLOW_STATE_IDLE], workflow.state);

    return (
      <div>
        <div className="table-container">
          <table className="table table--form table--row-hovers">
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
                    <ActionLink
                      action="run"
                      className="u-margin-right-tiny"
                      onClick={this.handleRunMacro(macro)}
                      label={macro.name}
                      isDisabled={!canRunMacro}
                      renderWithLabel
                    />
                  </td>
                  <td style={{width: '1%'}}>
                    <div className="nowrap">
                      <Button
                        compact
                        btnSize="xs"
                        btnStyle="flat"
                        disabled={!canLoadMacro}
                        onClick={this.handleLoadMacro(macro)}
                        title={i18n._('Load Macro')}
                      >
                        <i className="fa fa-chevron-up" />
                      </Button>
                      <ActionLink action="edit" onClick={this.handleEditMacro(macro)} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }
}

export default Macro;
