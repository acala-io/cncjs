import React, {Fragment} from 'react';
import {connect} from 'react-redux';
import {bool, func, object} from 'prop-types';

import {hide, leave} from './actions';

import Overlay from '../components_new/Overlay';

// Same duration as SCSS variable $transition-time--medium
const transitionTimeMedium = 250;

/*
* patchProps returns a patched version of the props where the common
* close method is attached as the onClose method or prepended to the
* call stack of the original onClose method. The patched method is
* likewise prepended to the call stack of the onConfirm method.
*/
const patchProps = (dialogProps = {}, close) => {
  const patched = {...dialogProps};

  // Ensure that close is called in case dialogProps supply a custom onClose
  if (patched.hasOwnProperty('onClose')) {
    patched.originalOnClose = dialogProps.onClose;
    patched.onClose = function() {
      close();
      return patched.originalOnClose();
    };
  } else {
    patched.onClose = close;
  }

  // Call onClose after confirm by default.
  // NOTE: cleanup logic called during onClose will most likely
  // change the state of the component it's called from and/or dispatch
  // redux methods which clean up global state. This is safe provided onConfirm
  // is called with arguments.
  if (patched.hasOwnProperty('onConfirm')) {
    patched.originalOnConfirm = dialogProps.onConfirm;
    patched.onConfirm = function() {
      patched.onClose();
      return patched.originalOnConfirm.apply(this, arguments);
    };
  }

  return patched;
};

const Dialogs = ({close, dialog, dialogProps = {}, leaving}) =>
  dialog ? (
    <Fragment>
      <Overlay />
      {React.createElement(dialog, {...patchProps(dialogProps, close), leaving})}
    </Fragment>
  ) : null;

Dialogs.propTypes = {
  close: func,
  dialog: func,
  dialogProps: object,
  leaving: bool,
};

const mapStateToProps = state => {
  const {currentDialog, dialogProps, leaving} = state.dialogs;

  if (currentDialog === null) {
    return {};
  }

  return {
    dialog: currentDialog,
    dialogProps,
    leaving,
  };
};

function mergeProps(stateProps, dispatchProps, ownProps) {
  const {dispatch} = dispatchProps;
  const {animated} = ownProps;

  return {
    ...stateProps,
    ...ownProps,
    close: () => {
      // animated is the default and needs to be explicitly false to be turned off
      if (animated === false) {
        dispatch(hide());
      } else {
        dispatch(leave());
        setTimeout(() => {
          dispatch(hide());
        }, transitionTimeMedium);
      }
    },
  };
}

export default connect(
  mapStateToProps,
  null,
  mergeProps
)(Dialogs);
