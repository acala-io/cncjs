import cx from 'classnames';
import find from 'lodash/find';
import includes from 'lodash/includes';
import map from 'lodash/map';
import PropTypes from 'prop-types';
import React, {Fragment, PureComponent} from 'react';
import Select from 'react-select';

import controller from '../../lib/controller';
import i18n from '../../lib/i18n';

import {GRBL, MARLIN, SMOOTHIE, TINYG} from '../../constants';

import Space from '../../components/Space';
import {ToastNotification} from '../../components/Notifications';

class Connection extends PureComponent {
  static propTypes = {
    actions: PropTypes.object,
    state: PropTypes.object,
  };

  isPortOpen(path) {
    const port = find(this.props.state.ports, {comName: path}) || {};

    return Boolean(port.isOpen);
  }

  render() {
    return (
      <Fragment>
        {this.alerts}
        {this.controllerSelection}
        {this.portSelection}
        {this.baudRateSelection}
        {this.enableFlowControl}
        {this.connectAutomatically}
        {this.connectionActions}
      </Fragment>
    );
  }

  get alerts() {
    const {alertMessage} = this.props.state;
    const {clearAlert} = this.props.actions;

    if (!alertMessage) {
      return null;
    }

    return (
      <ToastNotification style={{margin: '-10px -10px 10px -10px'}} type="error" onDismiss={clearAlert}>
        {alertMessage}
      </ToastNotification>
    );
  }

  get controllerSelection() {
    const {state, actions} = this.props;
    const {connected, loading} = state;

    const controllerType = state.controller.type;

    const canSelectControllers = controller.availableControllers.length > 1;
    const canChangeController = !loading && !connected;

    const hasGrblController = includes(controller.availableControllers, GRBL);
    const hasMarlinController = includes(controller.availableControllers, MARLIN);
    const hasSmoothieController = includes(controller.availableControllers, SMOOTHIE);
    const hasTinyGController = includes(controller.availableControllers, TINYG);

    if (!canSelectControllers) {
      return null;
    }

    return (
      <div className="form-group">
        <div className="input-group input-group-sm">
          <div className="input-group-btn">
            {hasGrblController && (
              <button
                type="button"
                className={cx('btn', 'btn-default', {'btn-select': controllerType === GRBL})}
                disabled={!canChangeController}
                onClick={() => {
                  actions.changeController(GRBL);
                }}
              >
                {GRBL}
              </button>
            )}
            {hasMarlinController && (
              <button
                type="button"
                className={cx('btn', 'btn-default', {'btn-select': controllerType === MARLIN})}
                disabled={!canChangeController}
                onClick={() => {
                  actions.changeController(MARLIN);
                }}
              >
                {MARLIN}
              </button>
            )}
            {hasSmoothieController && (
              <button
                type="button"
                className={cx('btn', 'btn-default', {'btn-select': controllerType === SMOOTHIE})}
                disabled={!canChangeController}
                onClick={() => {
                  actions.changeController(SMOOTHIE);
                }}
              >
                {SMOOTHIE}
              </button>
            )}
            {hasTinyGController && (
              <button
                type="button"
                className={cx('btn', 'btn-default', {'btn-select': controllerType === TINYG})}
                disabled={!canChangeController}
                onClick={() => {
                  actions.changeController(TINYG);
                }}
              >
                {TINYG}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  get portSelection() {
    const {state, actions} = this.props;
    const {connection, loading, connected, ports} = state;

    const notLoading = !loading;
    const notConnected = !connected;
    const canRefresh = notLoading && notConnected;
    const canChangePort = notLoading && notConnected;

    const style = {
      option: {
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      },
      value: {
        color: canChangePort ? '#333' : '#ccc',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
      },
    };

    const renderPortOption = option => (
      <div style={style.option} title={option.label}>
        <div>
          {option.isOpen && (
            <span>
              <i className="fa fa-lock" />
              <Space width="8" />
            </span>
          )}
          {option.label}
        </div>
        {option.manufacturer && <i>{i18n._('Manufacturer: {{manufacturer}}', {manufacturer: option.manufacturer})}</i>}
      </div>
    );

    const renderPortValue = option => (
      <div style={style.value} title={option.label}>
        {option.isOpen && (
          <span>
            <i className="fa fa-lock" />
            <Space width="8" />
          </span>
        )}
        {option.label}
      </div>
    );

    return (
      <div className="form-group">
        <label className="control-label">{i18n._('Port')}</label>
        <div className="input-group input-group-sm">
          <Select
            backspaceRemoves={false}
            className="sm"
            clearable={false}
            disabled={!canChangePort}
            name="port"
            noResultsText={i18n._('No ports available')}
            onChange={actions.onChangePortOption}
            optionRenderer={renderPortOption}
            options={map(ports, port => ({
              isOpen: port.isOpen,
              label: port.comName,
              manufacturer: port.manufacturer,
              value: port.comName,
            }))}
            placeholder={i18n._('Choose a port')}
            searchable={false}
            value={connection.serial.path}
            valueRenderer={renderPortValue}
          />
          <div className="input-group-btn">
            <button
              type="button"
              className="btn btn-default"
              name="btn-refresh"
              title={i18n._('Refresh')}
              onClick={actions.handleRefresh}
              disabled={!canRefresh}
            >
              <i className={cx('fa', 'fa-refresh', {'fa-spin': loading})} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  get baudRateSelection() {
    const {connection, loading, connected, baudRates} = this.props.state;
    const {baudRate, path} = connection.serial;
    const {onChangeBaudRateOption} = this.props.actions;

    const notLoading = !loading;
    const notConnected = !connected;
    const canChangeBaudRate = notLoading && notConnected && !this.isPortOpen(path);

    const style = {
      color: canChangeBaudRate ? '#333' : '#ccc',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    };

    const renderBaudRateValue = option => (
      <div style={style} title={option.label}>
        {option.label}
      </div>
    );

    return (
      <div className="form-group">
        <label className="control-label">{i18n._('Baud rate')}</label>
        <Select
          backspaceRemoves={false}
          className="sm"
          clearable={false}
          disabled={!canChangeBaudRate}
          menuContainerStyle={{zIndex: 5}}
          name="baudRate"
          onChange={onChangeBaudRateOption}
          options={map(baudRates, value => ({
            label: Number(value).toString(),
            value,
          }))}
          placeholder={i18n._('Choose a baud rate')}
          searchable={false}
          value={baudRate}
          valueRenderer={renderBaudRateValue}
        />
      </div>
    );
  }

  get enableFlowControl() {
    const {connected, connection} = this.props.state;
    const {toggleHardwareFlowControl} = this.props.actions;

    const enableHardwareFlowControl = Boolean(connection.serial.rtscts);
    const canToggleHardwareFlowControl = !connected;

    return (
      <div
        className={cx('checkbox', {
          disabled: !canToggleHardwareFlowControl,
        })}
      >
        <label>
          <input
            type="checkbox"
            defaultChecked={enableHardwareFlowControl}
            disabled={!canToggleHardwareFlowControl}
            onChange={toggleHardwareFlowControl}
          />
          {i18n._('Enable hardware flow control')}
        </label>
      </div>
    );
  }

  get connectAutomatically() {
    const {toggleAutoReconnect} = this.props.actions;
    const {autoReconnect} = this.props.state;

    return (
      <div className="checkbox">
        <label>
          <input type="checkbox" defaultChecked={autoReconnect} onChange={toggleAutoReconnect} />
          {i18n._('Connect automatically')}
        </label>
      </div>
    );
  }

  get connectionActions() {
    const {handleClosePort, handleOpenPort} = this.props.actions;
    const {connection, connecting, connected} = this.props.state;

    const canOpenPort = !connecting && !connected && connection.serial.path && connection.serial.baudRate;
    const canClosePort = connected;

    return (
      <div className="btn-group btn-group-sm">
        {!connected && (
          <button type="button" className="btn btn-primary" disabled={!canOpenPort} onClick={handleOpenPort}>
            <i className="fa fa-toggle-off" />
            <Space width="8" />
            {i18n._('Open')}
          </button>
        )}
        {connected && (
          <button type="button" className="btn btn-danger" disabled={!canClosePort} onClick={handleClosePort}>
            <i className="fa fa-toggle-on" />
            <Space width="8" />
            {i18n._('Close')}
          </button>
        )}
      </div>
    );
  }
}

export default Connection;
