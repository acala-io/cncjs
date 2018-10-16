import classcat from 'classcat';
import PropTypes from 'prop-types';
import React, {PureComponent} from 'react';

import './index.scss';

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
          'widget',
          {['widget-borderless']: borderless},
          {['widget-fullscreen']: fullscreen},
        ])}
        {...props}
      />
    );
  }
}

export default Widget;
