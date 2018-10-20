/*
 * Button component.
 *
 * Usage:
 * <Button text="Save" size="large" isDisabled={!this.isValid} onClick={() => { alert('hi'); }}/>
 *
 * <Button text="Save" width="full-width" isInProgress={this.isLoading} onClick={() => { alert('hi'); }}/>
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
  onClick,
  icon,
  isDisabled = false,
  isInProgress = false,
  size = 'normal',
  text,
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

  if (isInProgress) {
    return (
      <button className={classes} onClick={e => e && e.preventDefault()}>
        <LoadingIndicator background="dark" />
      </button>
    );
  }

  return (
    <button
      className={classes}
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
      {icon ? <Icon name={icon} className="none-lap" size="small" /> : null}
      {text}
    </button>
  );
};

Button.propTypes = {
  className: string,
  danger: bool,
  disabledMessage: oneOfType([string, bool]),
  disabledMessageHandler: func,
  onClick: func.isRequired,
  icon: string,
  isDisabled: bool,
  isInProgress: bool,
  size: oneOf(['normal', 'large']),
  text: string.isRequired,
  width: oneOf(['normal', 'full-width']),
};

export default Button;
