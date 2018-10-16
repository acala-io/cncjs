import classcat from 'classcat';
import PropTypes from 'prop-types';
import React, {PureComponent} from 'react';

import styles from './index.styl';

class Widget extends PureComponent {
  static propTypes = {
    borderless: PropTypes.bool,
    fullscreen: PropTypes.bool,
  };

  static defaultProps = {
    borderless: false,
    fullscreen: false,
  };

  render() {
    const {borderless, fullscreen, className, ...props} = this.props;

    return (
      <div
        className={classcat([
          className,
          styles.widget,
          {[styles.widgetBorderless]: borderless},
          {[styles.widgetFullscreen]: fullscreen},
        ])}
        {...props}
      />
    );
  }
}

export default Widget;
