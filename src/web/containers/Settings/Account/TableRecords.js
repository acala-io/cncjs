/* eslint react/jsx-no-bind: 0 */
import chainedFunction from 'chained-function';
import moment from 'moment';
import PropTypes from 'prop-types';
import React, {PureComponent} from 'react';

import i18n from '../../../lib/i18n';
import portal from '../../../lib/portal';

import {MODAL_CREATE_RECORD, MODAL_UPDATE_RECORD} from './constants';

import Anchor from '../../../components/Anchor';
import Modal from '../../../components/Modal';
import Space from '../../../components/Space';
import Table from '../../../components/Table';
import ToggleSwitch from '../../../components/ToggleSwitch';
import {Button} from '../../../components/Buttons';
import {TablePagination} from '../../../components/Paginations';

import styles from './index.styl';

class TableRecords extends PureComponent {
  static propTypes = {
    actions: PropTypes.object,
    state: PropTypes.object,
  };

  render() {
    const {actions, state} = this.props;

    return (
      <Table
        bordered={false}
        justified={false}
        data={state.api.err || state.api.fetching ? [] : state.records}
        rowKey={record => {
          return record.id;
        }}
        emptyText={() => {
          if (state.api.err) {
            return <span className="text-danger">{i18n._('An unexpected error has occurred.')}</span>;
          }

          if (state.api.fetching) {
            return (
              <span>
                <i className="fa fa-fw fa-spin fa-circle-o-notch" />
                <Space width="8" />
                {i18n._('Loading...')}
              </span>
            );
          }

          return i18n._('No data to display');
        }}
        title={() => (
          <div className={styles.tableToolbar}>
            <button
              type="button"
              className="btn btn-default"
              onClick={() => {
                actions.openModal(MODAL_CREATE_RECORD);
              }}
            >
              <i className="fa fa-plus" />
              <Space width="8" />
              {i18n._('New')}
            </button>
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
          </div>
        )}
        columns={[
          {
            key: 'enabled',
            title: i18n._('Enabled'),
            render: (value, row) => {
              const {id, enabled} = row;
              const title = enabled ? i18n._('Enabled') : i18n._('Disabled');

              return (
                <ToggleSwitch
                  checked={enabled}
                  size="sm"
                  title={title}
                  onChange={() => {
                    actions.updateRecord(id, {enabled: !enabled});
                  }}
                />
              );
            },
          },
          {
            key: 'name',
            title: i18n._('Username'),
            render: (value, row) => {
              const {name} = row;

              return (
                <Anchor
                  onClick={() => {
                    actions.openModal(MODAL_UPDATE_RECORD, row);
                  }}
                >
                  {name}
                </Anchor>
              );
            },
          },
          {
            className: 'text-nowrap',
            key: 'date-modified',
            title: i18n._('Date Modified'),
            render: (value, row) => {
              const {mtime} = row;
              if (mtime) {
                return moment(mtime).format('lll');
              }

              return '–';
            },
          },
          {
            className: 'text-nowrap',
            key: 'action',
            title: i18n._('Action'),
            render: (value, row) => {
              const {id} = row;

              return (
                <div>
                  <button
                    type="button"
                    className="btn btn-xs btn-default"
                    title={i18n._('Edit Account')}
                    onClick={() => {
                      actions.openModal(MODAL_UPDATE_RECORD, row);
                    }}
                  >
                    <i className="fa fa-fw fa-edit" />
                  </button>
                  <button
                    type="button"
                    className="btn btn-xs btn-default"
                    title={i18n._('Delete Account')}
                    onClick={() => {
                      portal(({onClose}) => (
                        <Modal size="xs" onClose={onClose}>
                          <Modal.Header>
                            <Modal.Title>
                              {i18n._('Settings')}
                              <Space width="8" />
                              &rsaquo;
                              <Space width="8" />
                              {i18n._('My Account')}
                            </Modal.Title>
                          </Modal.Header>
                          <Modal.Body>{i18n._('Are you sure you want to delete the account?')}</Modal.Body>
                          <Modal.Footer>
                            <Button onClick={onClose}>{i18n._('Cancel')}</Button>
                            <Button
                              btnStyle="primary"
                              onClick={chainedFunction(() => {
                                actions.deleteRecord(id);
                              }, onClose)}
                            >
                              {i18n._('OK')}
                            </Button>
                          </Modal.Footer>
                        </Modal>
                      ));
                    }}
                  >
                    <i className="fa fa-fw fa-trash" />
                  </button>
                </div>
              );
            },
          },
        ]}
      />
    );
  }
}

export default TableRecords;