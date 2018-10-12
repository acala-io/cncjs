import classcat from 'classcat';
import React, {Fragment, PureComponent} from 'react';
import {connect} from 'react-redux';
import {bool, func, node, oneOf, string} from 'prop-types';

import Icon from './Icon';

class ActualDialog extends PureComponent {
  static propTypes = {
    animated: bool,
    children: node,
    className: string,
    leaving: bool,
    onClose: func,
    width: oneOf(['normal', 'wide', 'extraWide', 'full']),
  };

  static defaultProps = {
    animated: true,
    className: '',
    leaving: false,
    width: 'normal',
  };

  handleClosing = e => {
    if (e) {
      e.stopPropagation();
    }

    this.props.onClose();
  };

  render() {
    return (
      <Fragment>
        {this.closeLink}
        {this.dialog}
      </Fragment>
    );
  }

  get dialog() {
    const {animated, children, className, width, leaving} = this.props;
    const classes = classcat([
      'dialog',
      {
        'dialog--animation-appear': animated,
        'dialog--animation-leave': animated && leaving,
        'dialog--extra-wide': width === 'extraWide',
        'dialog--full-width': width === 'full',
        'dialog--wide': width === 'wide',
      },
      className,
    ]);

    return (
      <div className={classes}>
        <div className="dialog__shadow-wrapper">{children}</div>
      </div>
    );
  }

  get closeLink() {
    const {onClose} = this.props;

    if (!onClose) {
      return null;
    }

    return (
      <span className="dialog__close-link tooltip tooltip--left" data-title={'cancel'} onClick={this.handleClosing}>
        <Icon name="cancel" />
      </span>
    );
  }
}

export const Dialog = connect(function(state) {
  return {
    leaving: state.dialogs.leaving,
  };
})(ActualDialog);

export default Dialog;

export const DialogHeader = ({heading}) => (
  <header className="dialog__header">
    <h2 className="dialog__heading">{heading}</h2>
  </header>
);

DialogHeader.propTypes = {
  heading: string.isRequired,
};

export const DialogActions = ({children}) => <div className="dialog__actions">{children}</div>;

DialogActions.propTypes = {
  children: node,
};

export const DialogFooter = ({children, noPad = false}) => (
  <footer className={classcat(['dialog__footer', {'dialog__footer--no-padding': noPad}])}>{children}</footer>
);

DialogFooter.propTypes = {
  children: node,
  noPad: bool,
};
