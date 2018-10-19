/*
 * Multi-purpose input component.
 *
 * Usage:
 * <Input
 *   placeholder={'hello'}
 *   className="input--huge input--long"
 *   value={'hi'}
 *   onChange={this.doIt}
 *   autoFocus
 * />
 */

import React, {Component} from 'react';
import {bool, func, string} from 'prop-types';

export default class Input extends Component {
  static propTypes = {
    autoFocus: bool,
    className: string,
    onBlur: func,
    onChange: func.isRequired,
    placeholder: string,
    value: string,
  };

  static defaultProps = {
    autoFocus: false,
    className: '',
    placeholder: '',
    value: '',
  };

  state = {
    value: this.props.value,
  };

  setValue = e => {
    e.preventDefault();
    const {value} = e.target;

    this.setState({value});
    this.props.onChange(value);
  };

  render() {
    return <div>{this.input}</div>;
  }

  get input() {
    const {autoFocus, className, onBlur, placeholder} = this.props;
    const {value} = this.state;
    const inputProps = {
      autoFocus: value ? false : autoFocus,
      className,
      onBlur,
      placeholder,
    };

    return <input type="text" value={value} onChange={this.setValue} {...inputProps} />;
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (nextProps.value !== this.state.value) {
      this.setState({value: nextProps.value});
    }
  }
}
