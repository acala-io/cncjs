import classcat from 'classcat';
import {arrayOf, node, oneOfType, string} from 'prop-types';
import React, {Component} from 'react';

import Button from './Button';
import Icon from './Icon';

export default class ActionDropdown extends Component {
  static defaultProps = {
    buttonProps: node.isRequired,
    children: oneOfType([arrayOf(node), node]).isRequired,
    className: string,
  };

  state = {
    collapsed: true,
  };

  render() {
    const {buttonProps, children, className} = this.props;
    const {collapsed} = this.state;

    return (
      <div className={classcat(['action-dropdown', className])}>
        <div className="action-dropdown__buttons">
          <Button {...buttonProps} />
          <div
            className="action-dropdown__trigger"
            onMouseDown={() => {
              this.setState({collapsed: !collapsed});
            }}
          >
            <Icon name="show-hide" rotate={collapsed ? 0 : 180} />
          </div>
        </div>
        <div className={classcat(['action-dropdown__items', {'is-collapsed': collapsed}])}>{children}</div>
      </div>
    );
  }
}
