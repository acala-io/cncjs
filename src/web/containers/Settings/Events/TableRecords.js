/* eslint react/jsx-no-bind: 0 */

import chainedFunction from 'chained-function';
import moment from 'moment';
import PropTypes from 'prop-types';
import React, {PureComponent} from 'react';
import take from 'lodash/take';

import i18n from '../../../lib/i18n';
import portal from '../../../lib/portal';

import {MODAL_CREATE_RECORD, MODAL_UPDATE_RECORD} from './constants';

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
    const {state, actions} = this.props;

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
                {i18n._('Loading')}
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
            title: i18n._('Enabled'),
            key: 'enabled',
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
            className: 'text-nowrap',
            key: 'event',
            title: i18n._('Event'),
            render: (value, row) => {
              const eventText =
                {
                  'connection:close': i18n._('Close'),
                  'connection:open': i18n._('Open'),
                  'macro:load': i18n._('Load Macro'),
                  'macro:run': i18n._('Run Macro'),
                  'sender:load': i18n._('G-code: Load'),
                  'sender:pause': i18n._('G-code: Pause'),
                  'sender:resume': i18n._('G-code: Resume'),
                  'sender:start': i18n._('G-code: Start'),
                  'sender:stop': i18n._('G-code: Stop'),
                  'sender:unload': i18n._('G-code: Unload'),
                  cyclestart: i18n._('Cycle Start'),
                  feedhold: i18n._('Feed Hold'),
                  homing: i18n._('Homing'),
                  sleep: i18n._('Sleep'),
                  startup: i18n._('Startup'),
                }[row.event] || '';

              return eventText;
            },
          },
          {
            className: 'text-nowrap',
            key: 'trigger',
            title: i18n._('Trigger'),
            render: (value, row) => {
              const {trigger} = row;

              if (trigger === 'system') {
                return <span>{i18n._('System')}</span>;
              }

              if (trigger === 'gcode') {
                return <span>{i18n._('G-code')}</span>;
              }

              return '–';
            },
          },
          {
            key: 'commands',
            title: i18n._('Commands'),
            render: (value, row) => {
              const style = {
                background: 'inherit',
                border: 'none',
                margin: 0,
                padding: 0,
              };
              const {commands} = row;
              const lines = String(row.commands).split('\n');
              const limit = 4;

              if (lines.length > limit) {
                return (
                  <pre style={style}>
                    {take(lines, limit).join('\n')}
                    {'\n'}
                    {i18n._('and more...')}
                  </pre>
                );
              }

              return <pre style={style}>{commands}</pre>;
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
                    title={i18n._('Update')}
                    onClick={() => {
                      actions.openModal(MODAL_UPDATE_RECORD, row);
                    }}
                  >
                    <i className="fa fa-fw fa-edit" />
                  </button>
                  <button
                    type="button"
                    className="btn btn-xs btn-default"
                    title={i18n._('Delete')}
                    onClick={() => {
                      portal(({onClose}) => (
                        <Modal size="xs" onClose={onClose}>
                          <Modal.Header>
                            <Modal.Title>
                              {i18n._('Settings')}
                              <Space width="8" />
                              &rsaquo;
                              <Space width="8" />
                              {i18n._('Events')}
                            </Modal.Title>
                          </Modal.Header>
                          <Modal.Body>{i18n._('Are you sure you want to delete this item?')}</Modal.Body>
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
