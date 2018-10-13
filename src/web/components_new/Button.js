/*
 * Button component.
 *
 * Usage:
 * <Button text="Save" size="large" isDisabled={!this.isValid} handleClick={() => { alert('hi'); }}/>
 *
 * <Button text="Save" width="full-width" isInProgress={this.isLoading} handleClick={() => { alert('hi'); }}/>
 */

import classcat from 'classcat';
import React from 'react';
import {bool, func, oneOf, oneOfType, string} from 'prop-types';

import Icon from './Icon';
import LoadingIndicator from './LoadingIndicator';

const Button = ({
  className = '',
  danger = false,
  disabledMessage = false,
  disabledMessageHandler = window.alert,
  handleClick,
  icon,
  isDisabled = false,
  isInProgress = false,
  selSelector = 'button',
  size = 'normal',
  text,
  textShortened = '',
  width = 'normal',
}) => {
  const classes = classcat([
    'button',
    {
      'button--danger': danger,
      'button--full-width': width === 'full-width',
      'button--large': size === 'large',
      'is-disabled': isDisabled,
      'is-in-progress': isInProgress,
    },
    className,
  ]);

  let buttonText = text;
  if (textShortened.length > 0) {
    buttonText = (
      <span>
        <span className="none-lap">{text}</span>
        <span className="none inline-lap">{textShortened}</span>
      </span>
    );
  }

  if (isInProgress) {
    return (
      <button data-sel-selector={selSelector} className={classes} onClick={e => e && e.preventDefault()}>
        <LoadingIndicator background="dark" />
      </button>
    );
  }

  return (
    <button
      data-sel-selector={selSelector}
      className={classes}
      onClick={e => {
        if (isDisabled) {
          if (disabledMessage !== false) {
            disabledMessageHandler(disabledMessage);
          }

          return e && e.preventDefault();
        }

        handleClick();
      }}
    >
      {icon ? <Icon name={icon} className="none-lap" /> : null}
      {buttonText}
    </button>
  );
};

Button.propTypes = {
  className: string,
  danger: bool,
  disabledMessage: oneOfType([string, bool]),
  disabledMessageHandler: func,
  handleClick: func.isRequired,
  icon: string,
  isDisabled: bool,
  isInProgress: bool,
  selSelector: string,
  size: oneOf(['normal', 'large']),
  text: string.isRequired,
  textShortened: string,
  width: oneOf(['normal', 'full-width']),
};

export default Button;
