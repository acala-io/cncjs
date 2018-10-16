/* eslint-disable react/forbid-foreign-prop-types */

import classcat from 'classcat';
import PropTypes from 'prop-types';
import React, {PureComponent} from 'react';

import Anchor from '../Anchor';

import './index.scss';

class Button extends PureComponent {
  static propTypes = {
    ...Anchor.propTypes,
    inverted: PropTypes.bool,
  };

  static defaultProps = {
    ...Anchor.defaultProps,
    inverted: false,
  };

  render() {
    const {className, inverted, ...props} = this.props;

    return (
      <Anchor
        {...props}
        className={classcat([
          className,
          'widget-button',
          {
            disabled: Boolean(props.disabled),
            inverted: inverted,
          },
        ])}
      />
    );
  }
}

export default Button;
