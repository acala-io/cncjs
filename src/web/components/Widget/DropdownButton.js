/* eslint-disable react/forbid-foreign-prop-types */

import PropTypes from 'prop-types';
import React, {PureComponent} from 'react';

import Dropdown from '../Dropdown';
import {Button} from '../Buttons';

import './index.scss';

class DropdownButton extends PureComponent {
  static propTypes = {
    ...Dropdown.propTypes,

    // One of: 'lg', 'md', 'sm', 'xs'
    btnSize: Button.propTypes.btnSize,

    // One of: 'default', 'primary', 'emphasis', 'flat', 'link'
    btnStyle: Button.propTypes.btnStyle,

    // toggle
    toggle: PropTypes.node.isRequired,

    // Align the menu to the right side of the dropdown toggle.
    pullRight: PropTypes.bool,

    // Whether to prevent a caret from being rendered next to the title.
    noCaret: PropTypes.bool,
  };

  static defaultProps = {
    noCaret: true,
    pullRight: true,
  };

  render() {
    const {btnSize, toggle, style, children, ...props} = this.props;

    // Split component props
    const dropdownProps = {};
    const toggleProps = {};

    Object.keys(props).forEach(propName => {
      const propValue = props[propName];
      if (Dropdown.ControlledComponent.propTypes[propName]) {
        dropdownProps[propName] = propValue;
      } else {
        toggleProps[propName] = propValue;
      }
    });

    return (
      <Dropdown
        {...dropdownProps}
        style={{
          ...style,
          float: 'left',
        }}
        btnSize={btnSize}
      >
        <Dropdown.Toggle {...toggleProps} className="widget-button" componentClass="a">
          {toggle}
        </Dropdown.Toggle>
        <Dropdown.Menu>{children}</Dropdown.Menu>
      </Dropdown>
    );
  }
}

export default DropdownButton;
