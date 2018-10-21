/* eslint-disable react/prop-types */

import React, {Fragment, PureComponent} from 'react';
import {connect} from 'react-redux';

import controller from '../lib/controller';
import i18n from '../lib/i18n';

import * as dialogs from '../dialogs/actions';

import Button from '../components_new/Button';
import ConnectionModal from '../widgets/Connection/ConnectionModal';
import Flexbox from '../components_new/Flexbox';
import MachineControlFunctions from './MachineControlFunctions';

class Header extends PureComponent {
  render() {
    return (
      <Flexbox justifyContent="space-between" alignItems="center" className="u-padding-small">
        <Flexbox>{this.machineConnect}</Flexbox>
        <Flexbox>{this.gcodePlayer}</Flexbox>
        <Flexbox>
          <MachineControlFunctions />
        </Flexbox>
      </Flexbox>
    );
  }

  get machineConnect() {
    const homeMachine = () => controller.command('homing');
    const connectMachine = this.props.configureConnection;
    const isDisabled = false; // disable when machine is not idle

    return (
      <Fragment>
        <Button text={i18n._('Connect Machine')} isDisabled={isDisabled} onClick={connectMachine} size="large" />
        <Button
          text={i18n._('Home Machine')}
          icon="homing"
          isDisabled={isDisabled}
          onClick={homeMachine}
          size="large"
        />
      </Fragment>
    );
  }

  get gcodePlayer() {
    return null;

    // TO BE DONE!
  }
}

const mapStateToProps = () => {
  return {};
};

const mapDispatchToProps = (dispatch, state) => ({
  ...state,
  configureConnection: () => {
    dispatch(dialogs.show(ConnectionModal, {}));
  },
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Header);
