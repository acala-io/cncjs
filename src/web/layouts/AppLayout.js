import classcat from 'classcat';
import React, {Component} from 'react';
import {connect} from 'react-redux';
import {bool, node} from 'prop-types';

import Dialogs from '../dialogs';
import FlashMessages from '../components_new/FlashMessages';

class AppLayout extends Component {
  static propTypes = {
    children: node.isRequired,
    hasOverlay: bool,
  };

  render() {
    const {children, hasOverlay} = this.props;

    return (
      <div className="layout layout--app">
        <FlashMessages />
        <Dialogs />
        <div className={classcat([{'has-overlay': hasOverlay}])}>{children}</div>
      </div>
    );
  }
}

const mapStateToProps = (state, ownProps) => {
  const {currentDialog} = state.dialogs;

  return {
    children: ownProps.children,
    hasOverlay: Boolean(currentDialog),
  };
};

export default connect(mapStateToProps)(AppLayout);
