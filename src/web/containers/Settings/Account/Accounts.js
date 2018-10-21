/* eslint-disable react/jsx-no-bind */

import PropTypes from 'prop-types';
import React, {Fragment, PureComponent} from 'react';

import i18n from '../../../lib/i18n';

import {MODAL_CREATE_RECORD, MODAL_UPDATE_RECORD} from './constants';

import ActionLink from '../../../components_new/ActionLink';
import Button from '../../../components_new/Button';
import CreateAccount from './CreateAccount';
import EditAccount from './EditAccount';
import Flexbox from '../../../components_new/Flexbox';
import LoadingIndicator from '../../../components_new/LoadingIndicator';
import Toggle from '../../../components_new/Toggle';
import {TablePagination} from '../../../components/Paginations';

const AccountRow = ({account, actions}) => (
  <Flexbox flexDirection="row">
    <div>{account.name}</div>
    <div>
      {i18n._('Active')}
      <Toggle
        value={account.enabled}
        onClick={() => {
          actions.updateRecord(account.id, {enabled: !account.enabled});
        }}
      />
    </div>
    <div>
      <ActionLink
        action="edit"
        onClick={() => {
          actions.openModal(MODAL_UPDATE_RECORD, account);
        }}
      />
      <ActionLink
        action="delete"
        onClick={() => {
          actions.deleteRecord(account.id);
        }}
      />
    </div>
  </Flexbox>
);

AccountRow.propTypes = {
  account: PropTypes.array,
  actions: PropTypes.object,
};

class Accounts extends PureComponent {
  static propTypes = {
    actions: PropTypes.object,
    state: PropTypes.object,
  };

  render() {
    const {actions, state} = this.props;

    const isLoading = state.api.fetching;
    const hasError = state.api.err;
    const isOk = !(isLoading || hasError);

    const isAdding = state.modal.name === MODAL_CREATE_RECORD;
    const isEditing = state.modal.name === MODAL_UPDATE_RECORD;
    const canAdd = !(isAdding || isEditing);

    return (
      <Flexbox flexDirection="column" style={{width: '100%'}}>
        <Flexbox flexDirection="row" justifyContent="space-between">
          {canAdd && (
            <Button
              text={i18n._('New Account')}
              icon="add"
              onClick={() => {
                actions.openModal(MODAL_CREATE_RECORD);
              }}
              disabled={isLoading}
            />
          )}
          {this.pagination}
        </Flexbox>
        {isAdding && <CreateAccount state={state} actions={actions} />}
        <Flexbox flexDirection="column">
          {isLoading && <LoadingIndicator message={i18n._('Loading data')} fullScreen />}
          {hasError && <span className="text-danger">{i18n._('An unexpected error has occurred.')}</span>}
          {isOk && this.accounts}
        </Flexbox>
      </Flexbox>
    );
  }

  get accounts() {
    const {actions, state} = this.props;
    const {records} = state;

    if (!records || !records.length) {
      return <span>EmptyState: {i18n._('No data to display')}</span>;
    }

    const isEditing = state.modal.name === MODAL_UPDATE_RECORD;

    return (
      <Fragment>
        {records.map(
          r =>
            isEditing && r.id === state.modal.params.id ? (
              <EditAccount key={r.id} state={state} actions={actions} />
            ) : (
              <AccountRow key={r.id} account={{...r}} actions={actions} />
            )
        )}
      </Fragment>
    );
  }

  get pagination() {
    const {actions, state} = this.props;

    if (state.pagination.totalRecords < state.pagination.pageLength) {
      return null;
    }

    return (
      <TablePagination
        style={{
          position: 'absolute',
          right: 0,
          top: 0,
        }}
        page={state.pagination.page}
        pageLength={state.pagination.pageLength}
        totalRecords={state.pagination.totalRecords}
        onPageChange={({page, pageLength}) => {
          actions.fetchRecords({page, pageLength});
        }}
        prevPageRenderer={() => <i className="fa fa-angle-left" />}
        nextPageRenderer={() => <i className="fa fa-angle-right" />}
      />
    );
  }
}

export default Accounts;
