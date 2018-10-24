import React, {Fragment, PureComponent} from 'react';
import styled from 'styled-components';
import {arrayOf, func, node, object, oneOf, oneOfType, string, bool} from 'prop-types';
import {connect} from 'react-redux';

import Icon from './Icon';
import {Link} from './Link';

import animation from '../styles/animations/';
import mixin from '../styles/mixins/';

/* eslint-disable sort-keys */
const dialogWidthFactor = {
  default: 20,
  wide: 30,
  extraWide: 70,
  full: 96,
};
/* eslint-enable sort-keys */

const CloseLink = styled(Link)`
  /*
   * 1 - Make sure the close button is never covered by anything
   */

  ${mixin.pinTopRightFixed}
  ${animation.fadeIn}

  animation-delay: ${({theme}) => theme.transition.time.medium};
  cursor: pointer;
  display: inline-block;
  opacity: 0;
  padding: ${({theme}) => theme.size.large};
  text-align: center;
  z-index: ${({theme}) => theme.zIndex.topmost3}; /* 1 */
`;

const ShadowWrapper = styled.div`
  /*
   * 1 - Limit the maximum height of the dialog
   * 2 - Fallback for browsers that don't support vh units
   */

  background-color: ${({theme}) => theme.color.background.white};
  border-radius: ${({theme}) => theme.border.radius.large};
  box-shadow: ${({theme}) => theme.boxShadow.default};
  max-height: 800px; /* 1, 2 */
  max-height: 80vh; /* 1 */
  overflow-y: auto;

  ${({width = 'default'}) =>
    width === 'full' &&
    `
      /*
       * 1 - Assign a minimum height to dialog to avoid ridiculously small dialogs
       * 2 - Fallback for browsers that don't support vh units
       */

      min-height: 500px; /* 1, 2 */
      min-height: 80vh; /* 1 */
    `};
`;

const StyledDialog = styled.div`
  ${mixin.centerXY};
  ${({animated}) => animated && animation.slideDownIn};
  ${({animated, leaving}) => animated && leaving && animation.slideUpOut};

  border-radius: ${({theme}) => theme.border.radius.large};
  position: fixed;
  top: 50vh;
  z-index: ${({theme}) => theme.zIndex.topmost2};

  ${({theme, width = 'default'}) =>
    width === 'full'
      ? `
        max-width: calc(${theme.size.default} * ${dialogWidthFactor.full});
        width: calc(${theme.size.default} * ${dialogWidthFactor.full});
      `
      : `
        max-width: 100%;
        width: calc(${theme.size.default} * ${dialogWidthFactor[width] || 20});
      `};
`;

class ActualDialog extends PureComponent {
  static propTypes = {
    animated: bool,
    children: node,
    className: string,
    leaving: bool,
    onClose: func,
    style: object,
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
    const {animated, children, className, leaving, style, width} = this.props;

    return (
      <StyledDialog width={width} animated={animated} leaving={leaving}>
        <ShadowWrapper width={width} className={className} style={style}>
          {children}
        </ShadowWrapper>
      </StyledDialog>
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

const StyledDialogHeader = styled.header`
  padding: ${({theme}) => theme.size.default};
`;

const DialogHeading = styled.h2`
  font-size: ${({theme}) => theme.font.size.large};
  margin: 0;
  text-align: center;
`;

export const DialogHeader = ({children, heading}) => (
  <StyledDialogHeader>
    {heading && <DialogHeading>{heading}</DialogHeading>}
    {children}
  </StyledDialogHeader>
);

DialogHeader.propTypes = {
  children: oneOfType([arrayOf(node), node]),
  heading: string,
};

export const DialogActions = styled.div`
  padding: 0 ${({theme}) => theme.size.default} ${({theme}) => theme.size.default};

  button {
    font-size: ${({theme}) => theme.font.size.large};

    ${({fullWidth}) => fullWidth && 'width: 100%'};
  }
`;

DialogActions.propTypes = {
  children: oneOfType([arrayOf(node), node]),
};

export const DialogFooter = styled.footer`
  color: ${({theme}) => theme.color.text.lightest};
  display: block;
  position: absolute;
  text-align: center;
  width: 100%;

  ${({noPad, theme}) => !noPad && `padding: ${theme.size.default}`};

  a {
    display: block;
    padding: ${({theme}) => theme.font.size.default} 0;
  }
`;

DialogFooter.propTypes = {
  children: oneOfType([arrayOf(node), node]),
  noPad: bool,
};
