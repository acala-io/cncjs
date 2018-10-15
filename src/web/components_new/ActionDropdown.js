import classcat from 'classcat';
import PropTypes from 'prop-types';
import React, {Component} from 'react';

import Button from './Button';
import Icon from './Icon';

export default class ActionDropdown extends Component {
  static defaultProps = {
    buttonProps: PropTypes.node.isRequired,
    children: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.node), PropTypes.node]).isRequired,
  };

  state = {
    collapsed: true,
  };

  render() {
    const {buttonProps, children} = this.props;
    const {collapsed} = this.state;

    return (
      <div className="action-dropdown">
        <div className="action-dropdown__buttons">
          <Button {...buttonProps} />
          <div
            className="action-dropdown__trigger"
            onMouseDown={() => {
              this.setState({collapsed: !collapsed});
            }}
          >
            <Icon name="show-hide" size="small" rotate={collapsed ? 0 : 180} />
          </div>
        </div>
        <div className={classcat(['action-dropdown__items', {'is-collapsed': collapsed}])}>{children}</div>
      </div>
    );
  }
}
