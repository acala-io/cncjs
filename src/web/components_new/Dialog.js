import classcat from 'classcat';
import React, {Fragment, PureComponent} from 'react';
import styled from 'styled-components';
import {bool, func, node, oneOf, string} from 'prop-types';
import {connect} from 'react-redux';

import Icon from './Icon';
import {Link} from './Link';

import animation from '../styles/animations/';
import mixin from '../styles/mixins/';
import s from '../styles/variables';

const CloseLink = styled(Link)`
  /*
   * 1 - Make sure the close button is never covered by anything
   */

  ${mixin.pinTopRightFixed}
  ${animation.fadeIn}

  animation-delay: ${s.transition.time.medium};
  color: ${s.color.text.lighter} !important;
  cursor: pointer;
  display: inline-block;
  opacity: 0;
  padding: ${s.globalSpacingUnit.default};
  text-align: center;
  z-index: ${s.zIndex.topmost3}; /* 1 */

  &:hover {
    color: ${s.color.clickable.highlight} !important;
  }
`;

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
      <CloseLink onClick={this.handleClosing}>
        <Icon name="cancel" size="large" />
      </CloseLink>
    );
  }
}

export const Dialog = connect(state => ({
  leaving: state.dialogs.leaving,
}))(ActualDialog);

export default Dialog;

export const DialogHeader = ({heading}) => (
  <header className="dialog__header">
    <h2 className="dialog__heading">{heading}</h2>
  </header>
);

DialogHeader.propTypes = {
  heading: string.isRequired,
};

export const DialogActions = styled.div`
  padding: 0 ${s.globalSpacingUnit.default} ${s.globalSpacingUnit.default};

  .button {
    font-size: ${s.font.size.large};

    /*
     * 1 - Make buttons full width, except for in full-width dialogs
     */
    .dialog:not(.dialog--full-width) & {
      width: 100%; /* 1 */
    }
  }
`;

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
