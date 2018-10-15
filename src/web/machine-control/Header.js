/* eslint-disable react/prop-types */

import React, {Fragment, PureComponent} from 'react';
import {connect} from 'react-redux';

import controller from '../lib/controller';
import i18n from '../lib/i18n';

import * as dialogs from '../dialogs/actions';

import ActionDropdown from '../components_new/ActionDropdown';
import Button from '../components_new/Button';
import MachineControlFunctions from './MachineControlFunctions';
import SettingsModal from '../settings/SettingsModal';

class Header extends PureComponent {
  render() {
    return (
      <div className="header">
        <div>{this.machineConnect}</div>
        <div>{this.gcodePlayer}</div>
        <div>{this.settings}</div>
      </div>
    );
  }

  get machineConnect() {
    const homeMachine = () => controller.command('homing');
    const connectMachine = () => {}; // noop
    const isDisabled = false; // disable when machine is not idle

    return (
      <Fragment>
        <div className="relative">
          <ActionDropdown
            buttonProps={{
              handleClick: connectMachine,
              isDisabled,
              text: i18n._('Connect Machine'),
            }}
          >
            <Button text={i18n._('Connect Machine')} isDisabled={isDisabled} handleClick={connectMachine} />
            <Button text={i18n._('Connect Machine')} isDisabled={isDisabled} handleClick={connectMachine} />
          </ActionDropdown>
        </div>
        <Button text={i18n._('Home Machine')} isDisabled={isDisabled} handleClick={homeMachine} />
      </Fragment>
    );
  }

  get gcodePlayer() {
    return <MachineControlFunctions />;
  }

  get settings() {
    return (
      <div className="link" onClick={this.props.editSettings}>
        Settings
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
