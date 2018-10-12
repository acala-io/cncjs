import classcat from 'classcat';
import React, {PureComponent} from 'react';
import {connect} from 'react-redux';

import controller from '../lib/controller';
import i18n from '../lib/i18n';

import Button from '../components_new/Button';

import MachineControlFunctions from './MachineControlFunctions';

class Header extends PureComponent {
  render() {
    return (
      <div
        style={{
          alignContent: 'space-between',
          alignItems: 'center',
          display: 'flex',
          flexFlow: 'row',
          justifyContent: 'space-between',
          padding: 14,
        }}
      >
        <div>{this.machineConnect}</div>
        <div>{this.gcodePlayer}</div>
        <div>{this.settings}</div>
      </div>
    );
  }

  get machineConnect() {
    const homeMachine = () => controller.command('homing');
    const isDisabled = false; // disable when machine is not idle

    return <Button text={i18n._('Homing')} isDisabled={isDisabled} handleClick={homeMachine} />;
  }

  get gcodePlayer() {
    return <MachineControlFunctions />;
  }

  get settings() {
    return 'settings';
  }
}

const mapStateToProps = (state, ownProps) => {
  return {};
};

const mapDispatchToProps = (state, dispatch, ownProps) => {
  return {};
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Header);
