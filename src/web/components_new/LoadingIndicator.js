/*
 * Renders an animated loading indicator.
 * Can optionally be displayed with large spacing around it.
 *
 * Usage:
 * <LoadingIndicator message="Loading user data"/>
 */

import React from 'react';
import styled from 'styled-components';
import {bool, string} from 'prop-types';

import Hint from './Hint';

import animation from '../styles/animations/';
import mixin from '../styles/mixins/';

const Dots = styled.div``;

const Dot = styled.div`
  ${animation.pulsate};

  background-color: ${({dark, theme}) => (dark ? theme.color.text.lightest : theme.color.background.white)};
  border-radius: ${({theme}) => theme.border.radius.circle};
  display: inline-block;
  height: ${({theme}) => theme.size.default};
  width: ${({theme}) => theme.size.default};

  :first-of-type {
    animation-delay: 320ms;
  }

  :nth-of-type(2) {
    animation-delay: 160ms;
  }

  + & {
    margin-left: ${({theme}) => theme.size.small};
  }

  ${({fullScreen}) =>
    fullScreen &&
    `
    /*
     * 1 - Center vertically
     */

    margin-bottom: 0;
    margin-top: 33vh; /* 1 */
  `};
`;

const LoadingMessage = styled(Hint)`
  ${mixin.centerX};

  color: ${({theme}) => theme.color.text.lighter};
  display: block;
  margin-top: ${({theme}) => theme.size.small};
  white-space: nowrap;
`;

const StyledLoadingIndicator = styled.div`
  /*
   * 1 - Allow Dots to be positioned absolute
   */

  ${mixin.centerMX};
  ${animation.fadeIn};

  animation-delay: ${({theme}) => theme.transition.time.slow};
  animation-duration: ${({theme}) => theme.transition.time.verySlow};
  padding: ${({theme}) => theme.size.default} 0;
  position: relative; /* 1 */
  text-align: center;
  width: ${({theme}) => theme.size.huge};
`;

const LoadingIndicator = ({centerY = false, dark = false, fullScreen = false, message = ''}) => (
  <StyledLoadingIndicator centerY={centerY} fullScreen={fullScreen} dark={dark}>
    <Dots>
      <Dot />
      <Dot />
      <Dot />
    </Dots>
    {message && <LoadingMessage>{message}</LoadingMessage>}
  </StyledLoadingIndicator>
);

LoadingIndicator.propTypes = {
  centerY: bool,
  dark: bool,
  fullScreen: bool,
  message: string,
};

export default LoadingIndicator;
