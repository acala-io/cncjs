/*
 * Padding component.
 *
 * Usage:
 * <Padding>
 *   Please think before printing this website.
 * </Padding>
 *
 * <Padding sides="top">
 *   Please think before printing this website.
 * </Padding>
 *
 * <Padding sides="vertical" size="tiny">
 *   Please think before printing this website.
 * </Padding>
 */

import {arrayOf, node, oneOf, oneOfType} from 'prop-types';
import React from 'react';

const Padding = ({children, sides = '', size = ''}) => (
  <span className={['u-padding', sides, size].filter(Boolean).join('-')}>{children}</span>
);

Padding.propTypes = {
  children: oneOfType([arrayOf(node), node]).isRequired,
  sides: oneOf(['bottom', 'horizontal', 'left', 'right', 'top', 'vertical']),
  size: oneOf(['tiny', 'small', 'large', 'huge']),
};

export default Padding;
