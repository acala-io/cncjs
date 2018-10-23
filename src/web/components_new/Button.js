/*
 * Button component.
 *
 * Usage:
 * <Button text="Save" size="large" isDisabled={!this.isValid} onClick={() => { alert('hi'); }}/>
 *
 * <Button text="Save" isInProgress={this.isLoading} onClick={() => { alert('hi'); }} fullWidth/>
 */

import Color from 'color';
import React from 'react';
import styled from 'styled-components';
import {bool, func, oneOf, oneOfType, string} from 'prop-types';

import Icon from './Icon';
import LoadingIndicator from './LoadingIndicator';

import mixin from '../styles/mixins/';
import s from '../styles/theme';

const visualZHeight = '1.5px';

const StyledButton = styled.button`
  /*
   * 1 - Add shadow at bottom of button to create spatial depth and make button stand out
   * 2 - Always vertically center buttons with other elements
   */

  ${mixin.truncateText} appearance: none;
  background-color: ${s.color.clickable.default};
  border-radius: ${s.border.radius.large};
  border: 0;
  box-shadow: inset -1px -${visualZHeight} 0 hsla(0, 0%, 0%, 0.23); /* 1 */
  color: ${s.color.text.inverse};
  cursor: pointer;
  display: inline-block;
  font-weight: ${s.font.weight.normal};
  padding: ${s.size.small} ${s.size.default};
  text-align: center;
  text-shadow: 0 -1px 0 ${s.color.clickable.darker};
  transition: background, color ${s.transition.time.slow};
  user-select: none;
  vertical-align: middle; /* 2 */

  :hover {
    ${({isDisabled}) =>
      isDisabled
        ? ''
        : `
          background-color: ${s.color.clickable.highlight};
          color: ${s.color.text.inverse};
        `};
  }

  :active,
  :focus {
    outline: none;
  }

  /*
   * Visually push button down to surface by
   * 1 - Removing shadow that creates 3d effect -> appears flat
   * 2 - Adding margin on top of button -> moves button down
   * 3 - Reducing padding-bottom of button -> reduces height of button
   */

  :active {
    ${({isDisabled}) =>
      isDisabled
        ? ''
        : `
          box-shadow: inset 0 0 0 1px hsla(0, 0%, 0%, 0.08); /* 1 */
          margin-top: ${visualZHeight}; /* 2 */
          padding-bottom: calc(${s.size.small} - ${visualZHeight}); /* 3 */
        `};
  }

  /*
   * 1 - Equalize spacing around icon
   */
  .icon {
    display: inline-block;
    fill: ${s.color.text.inverse};
    filter: drop-shadow(0 -1px 0 ${s.color.clickable.darker});
    margin-left: -${s.size.tiny}; /* 1 */
    margin-right: ${s.size.small}; /* 1 */
    position: relative;
    vertical-align: middle;
  }

  ${({isDisabled}) =>
    isDisabled
      ? `
        background-color: ${s.color.background.default};
        border-color: ${s.color.transparent} ${Color(s.color.background.default)
          .darken(0.21)
          .string()} ${Color(s.color.background.default)
          .darken(0.21)
          .string()};
        cursor: not-allowed;
        text-shadow: 0 -1px 0 hsla(0, 0%, 0%, 0.13);

        .icon {
          filter: drop-shadow(0 -1px 0 hsla(0, 0%, 0%, 0.13));
        }
      `
      : ''};

  ${({danger}) =>
    danger
      ? `
      background-color: ${s.color.state.danger};
      border-color: ${Color(s.color.state.danger)
        .darken(0.21)
        .string()};
      text-shadow: 0 -1px 0 ${Color(s.color.state.danger)
        .darken(0.21)
        .string()};

      :hover {
        background: ${Color(s.color.state.danger)
          .lighten(0.03)
          .string()}
      }

      .icon {
        filter: drop-shadow(
            0 -1px 0 ${Color(s.color.state.danger)
              .darken(0.25)
              .string()}
        );
      }
      `
      : ''};

  ${({fullWidth}) => (fullWidth ? 'width: 100%;' : '')};

  ${({isDisabled, size}) =>
    size === 'large'
      ? `
        font-size: ${s.font.size.large};
        padding-bottom: ${s.size.small};
        padding-top: ${s.size.small};

        :active {
          ${
            isDisabled
              ? ''
              : `
                padding-bottom: calc(${s.size.small} - ${visualZHeight}); /* 3 */
              `
          }
        }
        `
      : ''};

  ${({isDisabled, size}) =>
    size === 'huge'
      ? `
        font-size: ${s.font.size.large};
        padding: ${s.size.default} ${s.size.large};

        :active {
          ${
            isDisabled
              ? ''
              : `
                padding-bottom: calc(${s.size.default} - ${visualZHeight}); /* 3 */
              `
          }
        }
        `
      : ''};
`;

const Button = ({
  className = '',
  danger = false,
  disabledMessage = false,
  disabledMessageHandler = window.alert,
  fullWidth = false,
  icon,
  isDisabled = false,
  isInProgress = false,
  onClick,
  size = 'normal',
  text,
}) => {
  const buttonVariantProps = {
    className,
    danger,
    fullWidth,
    isDisabled,
    isInProgress,
    size,
  };

  if (isInProgress) {
    return (
      <StyledButton className={className} {...buttonVariantProps} onClick={e => e && e.preventDefault()} isDisabled>
        <LoadingIndicator dark />
      </StyledButton>
    );
  }

  return (
    <StyledButton
      className={className}
      {...buttonVariantProps}
      onClick={e => {
        if (isDisabled) {
          if (disabledMessage !== false) {
            disabledMessageHandler(disabledMessage);
          }

          return e && e.preventDefault();
        }

        onClick();
      }}
    >
      {icon ? <Icon name={icon} size="small" /> : null}
      {text}
    </StyledButton>
  );
};

Button.propTypes = {
  className: string,
  danger: bool,
  disabledMessage: oneOfType([string, bool]),
  disabledMessageHandler: func,
  fullWidth: bool,
  icon: string,
  isDisabled: bool,
  isInProgress: bool,
  onClick: func.isRequired,
  size: oneOf(['normal', 'large']),
  text: string.isRequired,
};

export default Button;
