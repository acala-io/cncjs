import classcat from 'classcat';
import PropTypes from 'prop-types';
import React, {Fragment, PureComponent} from 'react';
import Select from 'react-select';
import {find} from 'lodash';

import controller from '../../lib/controller';
import i18n from '../../lib/i18n';

import Button from '../../components_new/Button';
import ButtonGroup from '../../components_new/ButtonGroup';
import Icon from '../../components_new/Icon';
import Label from '../../components_new/Label';
// import Select from '../../components_new/Select';
import Space from '../../components/Space';
import Toggle from '../../components_new/Toggle';
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
    const {actions, state} = this.props;
    const {connected, loading} = state;

    const canSelectControllers = controller.availableControllers.length > 1;
    const canChangeController = !loading && !connected;

    if (!canSelectControllers || !canChangeController) {
      return null;
    }

    return (
      <div className="form-group">
        <label className="control-label">{i18n._('Controller')}</label>
        <ButtonGroup
          optionName="selectedController"
          options={controller.availableControllers}
          selectedValue={state.controller.type}
          onChange={actions.changeController}
          equalWidth
        />
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
        {/*
        <Select
          options={ports}
          selectedOption={connection.serial.path}
          optionFormatter={o => o.label}
          onChange={actions.onChangePortOption}
          disabled={!canChangePort}
        />
        */}
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
            options={ports.map(port => ({
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
              {/* TODO: spin during state 'loading' */}
              <Icon name="refresh" size="small" className={classcat([{'fa-spin': loading}])} />
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

    if (!canChangeBaudRate) {
      return null;
    }

    return (
      <div className="form-group">
        <label className="control-label">{i18n._('Baud rate [kilobaud]')}</label>
        <ButtonGroup
          optionName="selectedBaudRate"
          options={[...baudRates].reverse().map(b => ({label: b / 1000, value: b}))}
          selectedValue={Number(baudRate)}
          onChange={onChangeBaudRateOption}
          equalWidth
        />
      </div>
    );
  }

  get enableFlowControl() {
    const {connected, connection} = this.props.state;
    const {toggleHardwareFlowControl} = this.props.actions;

    const enableHardwareFlowControl = Boolean(connection.serial.rtscts);
    const canToggleHardwareFlowControl = !connected;

    if (!canToggleHardwareFlowControl) {
      return null;
    }

    return (
      <div className="form-group">
        <Label option>
          <Toggle value={enableHardwareFlowControl} onClick={toggleHardwareFlowControl} />
          {i18n._('Enable hardware flow control')}
        </Label>
      </div>
    );
  }

  get connectAutomatically() {
    const {toggleAutoReconnect} = this.props.actions;
    const {autoReconnect} = this.props.state;

    return (
      <div className="form-group">
        <Label option>
          <Toggle value={autoReconnect} onClick={toggleAutoReconnect} />
          {i18n._('Connect automatically')}
        </Label>
      </div>
    );
  }

  get connectionActions() {
    const {handleClosePort, handleOpenPort} = this.props.actions;
    const {connection, connecting, connected} = this.props.state;

    const canOpenPort = !connecting && !connected && connection.serial.path && connection.serial.baudRate;
    const canClosePort = connected;

    return (
      <div>
        {!connected && (
          <Button
            text={i18n._('Connect Machine')}
            isDisabled={!canOpenPort}
            onClick={handleOpenPort}
            size="large"
            fullWidth
          />
        )}
        {connected && (
          <Button
            text={i18n._('Disconnect')}
            isDisabled={!canClosePort}
            onClick={handleClosePort}
            size="large"
            fullWidth
            danger
          />
        )}
      </div>
    );
  }
}

export default Connection;
