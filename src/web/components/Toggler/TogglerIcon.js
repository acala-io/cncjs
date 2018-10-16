import classcat from 'classcat';
import PropTypes from 'prop-types';
import React, {PureComponent} from 'react';
import './index.scss';

class TogglerIcon extends PureComponent {
  static propTypes = {
    expanded: PropTypes.bool,
  };

  static defaultProps = {
    expanded: false,
  };

  render() {
    const {expanded, className, ...props} = this.props;

    return (
      <i
        {...props}
        className={classcat([
          className,
          'toggler-icon fa',
          {
            'fa-chevron-up': expanded,
            'fa-chevron-down': !expanded,
          },
        ])}
      />
    );
  }
}

export default TogglerIcon;
