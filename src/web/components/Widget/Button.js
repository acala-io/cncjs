/* eslint-disable react/forbid-foreign-prop-types */

import classcat from 'classcat';
import PropTypes from 'prop-types';
import React, {PureComponent} from 'react';
import Anchor from '../Anchor';
import styles from './index.styl';

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
    const {inverted, className, ...props} = this.props;

    return (
      <Anchor
        {...props}
        className={classcat([
          className,
          styles.widgetButton,
          {
            [styles.disabled]: Boolean(props.disabled),
            [styles.inverted]: inverted,
          },
        ])}
      />
    );
  }
}

export default Button;
