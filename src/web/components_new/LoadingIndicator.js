/*
 * Renders an animated loading indicator.
 * Can optionally be displayed with large spacing around it.
 *
 * Usage:
 * <LoadingIndicator message="Loading user data"/>
 */

import classcat from 'classcat';
import React from 'react';
import {bool, oneOf, string} from 'prop-types';

import Hint from './Hint';

const LoadingIndicator = ({
  background = 'white',
  centerY = false,
  fullScreen = false,
  message = '',
  spacing = 'normal',
}) => {
  const classes = classcat([
    'spinner text--centered',
    {
      'center--y': centerY,
      'spinner--dark': background === 'white',
      'spinner--full-screen': fullScreen,
      'u-mt++': spacing === 'large' && !fullScreen,
      'u-pv+': spacing === 'large' && !fullScreen,
    },
  ]);

  return (
    <div className={classes}>
      <div>
        <div className="spinner__item" />
        <div className="spinner__item" />
        <div className="spinner__item" />
      </div>
      {message ? <Hint className="spinner__message">{message}</Hint> : null}
    </div>
  );
};

LoadingIndicator.propTypes = {
  background: oneOf(['white', 'dark']),
  centerY: bool,
  fullScreen: bool,
  message: string,
  spacing: oneOf(['normal', 'large']),
};

export default LoadingIndicator;
