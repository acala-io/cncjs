/*
 * Button component.
 *
 * Usage:
 * <Button text="Save" size="large" disabled={!this.isValid} onClick={() => { alert('hi'); }}/>
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

const visualZHeight = '1.5px';

const ButtonIcon = styled(Icon)`
  /*
   * 1 - Equalize spacing around icon
   */

  display: inline-block;
  fill: ${({theme}) => theme.color.text.inverse};
  filter: drop-shadow(
    0 -1px 0 ${({danger, disabled, theme}) => {
        if (disabled) {
          return 'hsla(0, 0%, 0%, 0.13)';
        }

        if (danger) {
          return Color(theme.color.state.danger)
            .darken(0.25)
            .string();
        }

        return theme.color.clickable.darker;
      }}
  );
  margin-left: -${({theme}) => theme.size.tiny}; /* 1 */
  margin-right: ${({theme}) => theme.size.small}; /* 1 */
  position: relative;
  vertical-align: middle;
`;

const StyledButton = styled.button`
  /*
   * 1 - Add shadow at bottom of button to create spatial depth and make button stand out
   * 2 - Always vertically center buttons with other elements
   */

  ${mixin.truncateText};

  appearance: none;
  background-color: ${({theme}) => theme.color.clickable.default};
  border-radius: ${({theme}) => theme.border.radius.large};
  border: 0;
  box-shadow: inset -1px -${visualZHeight} 0 hsla(0, 0%, 0%, 0.23); /* 1 */
  color: ${({theme}) => theme.color.text.inverse};
  cursor: pointer;
  display: inline-block;
  font-weight: ${({theme}) => theme.font.weight.normal};
  padding: ${({theme}) => theme.size.small} ${({theme}) => theme.size.default};
  text-align: center;
  text-shadow: 0 -1px 0 ${({theme}) => theme.color.clickable.darker};
  transition: background, color ${({theme}) => theme.transition.time.slow};
  user-select: none;
  vertical-align: middle; /* 2 */

  :hover {
    ${({disabled}) =>
      !disabled &&
      `
        background-color: ${({theme}) => theme.color.clickable.highlight};
        color: ${({theme}) => theme.color.text.inverse};
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
    ${({disabled}) =>
      !disabled &&
      `
        box-shadow: inset 0 0 0 1px hsla(0, 0%, 0%, 0.08); /* 1 */
        margin-top: ${visualZHeight}; /* 2 */
        padding-bottom: calc(${({theme}) => theme.size.small} - ${visualZHeight}); /* 3 */
    `};
  }

  ${({danger, disabled, theme}) =>
    danger &&
    !disabled &&
    `
      background-color: ${theme.color.state.danger};
      border-color: ${Color(theme.color.state.danger)
        .darken(0.21)
        .string()};
      text-shadow: 0 -1px 0 ${Color(theme.color.state.danger)
        .darken(0.21)
        .string()};

      :hover {
        background: ${Color(theme.color.state.danger)
          .lighten(0.08)
          .string()}
      }
  `};

  ${({disabled, theme}) =>
    disabled &&
    `
      background-color: ${theme.color.background.default};
      border-color: ${theme.color.transparent} ${Color(theme.color.background.default)
      .darken(0.21)
      .string()} ${Color(theme.color.background.default)
      .darken(0.21)
      .string()};
      cursor: not-allowed;
      text-shadow: 0 -1px 0 hsla(0, 0%, 0%, 0.13);
  `};

  ${({fullWidth}) => fullWidth && 'width: 100%'};

  ${({disabled, size, theme}) =>
    size === 'large' &&
    `
      font-size: ${theme.font.size.large};
      padding-bottom: ${theme.size.small};
      padding-top: ${theme.size.small};

      :active {
        ${!disabled &&
          `
          padding-bottom: calc(${theme.size.small} - ${visualZHeight}); /* 3 */
        `}
      }
  `};

  ${({disabled, size, theme}) =>
    size === 'huge' &&
    `
      font-size: ${theme.font.size.large};
      padding: ${theme.size.default} ${theme.size.large};

      :active {
        ${!disabled &&
          `
          padding-bottom: calc(${theme.size.default} - ${visualZHeight}); /* 3 */
        `}
      }
  `};
`;

const preventDefault = e => e && e.preventDefault();

const Button = ({
  className = '',
  danger = false,
  disabledMessage = false,
  disabledMessageHandler = window.alert,
  fullWidth = false,
  icon,
  disabled = false,
  isInProgress = false,
  onClick,
  size = 'normal',
  text,
}) => {
  const buttonVariantProps = {
    className,
    danger,
    disabled,
    fullWidth,
    isInProgress,
    size,
  };

  if (isInProgress) {
    return (
      <StyledButton className={className} {...buttonVariantProps} onClick={preventDefault} disabled>
        <LoadingIndicator dark />
      </StyledButton>
    );
  }

  return (
    <StyledButton
      className={className}
      {...buttonVariantProps}
      onClick={e => {
        if (disabled) {
          if (disabledMessage !== false) {
            disabledMessageHandler(disabledMessage);
          }

          return e && e.preventDefault();
        }

        onClick();
      }}
    >
      {icon ? <ButtonIcon name={icon} size="small" danger={danger} disabled={disabled} /> : null}
      {text}
    </StyledButton>
  );
};

Button.propTypes = {
  className: string,
  danger: bool,
  disabled: bool,
  disabledMessage: oneOfType([string, bool]),
  disabledMessageHandler: func,
  fullWidth: bool,
  icon: string,
  isInProgress: bool,
  onClick: func.isRequired,
  size: oneOf(['normal', 'large']),
  text: string.isRequired,
};

export default Button;
