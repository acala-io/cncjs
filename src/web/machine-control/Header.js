/* eslint-disable react/prop-types */

import React, {Fragment, PureComponent} from 'react';
import {connect} from 'react-redux';

import controller from '../lib/controller';
import i18n from '../lib/i18n';

import * as dialogs from '../dialogs/actions';

import Button from '../components_new/Button';
import Icon from '../components_new/Icon';
import MachineControlFunctions from './MachineControlFunctions';
import SettingsModal from '../settings/SettingsModal';

class Header extends PureComponent {
  render() {
    return (
      <div className="header">
        <div>{this.machineConnect}</div>
        <div>{this.gcodePlayer}</div>
        <div>
          <MachineControlFunctions />
          {/* this.settings */}
        </div>
      </div>
    );
  }

  get machineConnect() {
    const homeMachine = () => controller.command('homing');
    const connectMachine = () => {}; // noop
    const isDisabled = false; // disable when machine is not idle

    return (
      <Fragment>
        <Button text={i18n._('Connect Machine')} isDisabled={isDisabled} handleClick={connectMachine} />
        <Button text={i18n._('Home Machine')} icon="homing" isDisabled={isDisabled} handleClick={homeMachine} />
      </Fragment>
    );
  }

  get gcodePlayer() {
    return null;
  }

  get settings() {
    return (
      <div className="link u-padding-small" onClick={this.props.editSettings}>
        <Icon name="settings" size="small" className="u-margin-right-tiny" />
        Settings
      </div>
    );
  }

  // TODO: this is just copied in from the Connection widget for mocking it
  get connectDetails() {
    return (
      <div>
        <div className="form-group">
          <label className="control-label">Controller</label>
          <div className="button-group">
            <label className="button-group__button is-selected">
              <input type="radio" name="selectedController" value="Grbl" checked="" />
              Grbl
            </label>
            <label className="button-group__button">
              <input type="radio" name="selectedController" value="Marlin" />
              Marlin
            </label>
            <label className="button-group__button">
              <input type="radio" name="selectedController" value="Smoothie" />
              Smoothie
            </label>
            <label className="button-group__button">
              <input type="radio" name="selectedController" value="TinyG" />
              TinyG
            </label>
          </div>
        </div>
        <div className="form-group">
          <label className="control-label">Port</label>
          <div className="input-group input-group-sm">
            <div className="Select sm Select--single">
              <div className="Select-control">
                <span className="Select-multi-value-wrapper" id="react-select-2--value">
                  <div className="Select-placeholder">Choose a port</div>
                  <div className="Select-input" role="combobox" />
                </span>
                <span className="Select-arrow-zone">
                  <span className="Select-arrow" />
                </span>
              </div>
            </div>
            <div className="input-group-btn">
              <button type="button" className="btn btn-default" name="btn-refresh" title="Refresh">
                <i className="fa fa-refresh" />
              </button>
            </div>
          </div>
        </div>
        <div className="form-group">
          <label className="control-label">Baud rate [kilobaud]</label>
          <div className="button-group">
            <label className="button-group__button">
              <input type="radio" name="selectedBaudRate" value="2400" />
              2.4
            </label>
            <label className="button-group__button">
              <input type="radio" name="selectedBaudRate" value="9600" />
              9.6
            </label>
            <label className="button-group__button is-selected">
              <input type="radio" name="selectedBaudRate" value="19200" checked="" />
              19.2
            </label>
            <label className="button-group__button">
              <input type="radio" name="selectedBaudRate" value="38400" />
              38.4
            </label>
            <label className="button-group__button">
              <input type="radio" name="selectedBaudRate" value="57600" />
              57.6
            </label>
            <label className="button-group__button">
              <input type="radio" name="selectedBaudRate" value="115200" />
              115.2
            </label>
            <label className="button-group__button">
              <input type="radio" name="selectedBaudRate" value="250000" />
              250
            </label>
          </div>
        </div>
        <div className="form-group">
          <div className="toggle">
            <label className="toggle__frame">
              <input type="checkbox" className="toggle__input bot__toggle-input" />
              <span className="toggle__labels" data-on="on" data-off="off" />
              <span className="toggle__handle" />
            </label>
          </div>
          <label className="inline-block">Enable hardware flow control</label>
        </div>
        <div className="form-group">
          <div className="toggle">
            <label className="toggle__frame">
              <input type="checkbox" className="toggle__input bot__toggle-input" checked="" />
              <span className="toggle__labels" data-on="on" data-off="off" />
              <span className="toggle__handle" />
            </label>
          </div>
          <label className="inline-block">Connect automatically</label>
        </div>
      </div>
    );
  }
}

const mapStateToProps = () => {
  return {};
};

const mapDispatchToProps = (dispatch, state) => ({
  ...state,
  editSettings: () => {
    dispatch(dialogs.show(SettingsModal, {}));
  },
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Header);
