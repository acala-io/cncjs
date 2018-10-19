/*
 * Renders a text input that validates and formats numerical data.
 *
 * Usage:
 * <NumberInput value={10} onChange={v => { alert(v); }}/>
 *
 * <NumberInput
 *   value={10}
 *   allowNegativeNumbers
 *   defaultValue={1}
 *   digits={2}
 *   min={-100}
 *   max={100}
 *   placeholder="0,00"
 *   onChange={v => { alert(v); }}
 * />
 */

import classcat from 'classcat';
import debounce from 'lodash/debounce';
import React, {Component} from 'react';
import {allowSpecialKeys, preventNonNumbers} from '../lib/key-events';
import {bool, func, number, oneOfType, string} from 'prop-types';
import {formatNumber} from '../lib/l10n';

export default class NumberInput extends Component {
  static propTypes = {
    allowNegativeNumbers: bool,
    autoFocus: bool,
    className: string,
    defaultValue: number,
    digits: number,
    max: number,
    min: number,
    narrow: bool,
    onChange: func,
    parseFunc: func,
    placeholder: string,
    updateImmediately: bool,
    value: oneOfType([number, string]),
    wide: bool,
  };

  static defaultProps = {
    allowNegativeNumbers: false,
    autoFocus: false,
    className: '',
    defaultValue: 1,
    digits: 0,
    narrow: false,
    onChange: value => {
      console.log(`The value is ${value}`);
    },
    parseFunc: value => parseFloat(value.toString().replace(',', '.')),
    placeholder: '0',
    updateImmediately: false,
    wide: false,
  };

  state = {
    value: this.formatInitialValue(this.props.value === undefined ? this.props.defaultValue : this.props.value),
  };

  // allow '-', if negative numbers are allowed
  allowMinus = e => this.props.allowNegativeNumbers && e.keyCode === 189;

  onUpdateImmediately = debounce(function() {
    if (this.props.updateImmediately) {
      this.endEdit();
    }
  }, 800).bind(this);

  onKeyDown = e => {
    const {defaultValue, max, min, parseFunc} = this.props;
    let value = defaultValue;

    if (this.state.value !== undefined && this.state.value !== '') {
      value = parseFunc(this.state.value);
    }

    // change value by 1 and 10 (with Shift key pressed), respectively
    const step = e.shiftKey ? 10 : 1;
    let newValue;
    if (e.key === 'ArrowDown') {
      newValue = value - step;

      if (max) {
        newValue = Math.min(newValue, max);
      }

      if (min) {
        newValue = Math.max(newValue, min);
      }

      this.setState(
        {
          value: newValue,
        },
        this.onUpdateImmediately
      );

      return true;
    } else if (e.key === 'ArrowUp') {
      newValue = value + step;

      if (max) {
        newValue = Math.min(newValue, max);
      }

      if (min) {
        newValue = Math.max(newValue, min);
      }

      this.setState(
        {
          value: newValue,
        },
        this.onUpdateImmediately
      );

      return true;
    }

    if (allowSpecialKeys(e)) {
      return true;
    }

    if (this.allowMinus(e, this.props)) {
      return true;
    }

    if (preventNonNumbers(e)) {
      e.preventDefault();
    }

    return true;
  };

  onChange = e => {
    this.setState(
      {
        value: e.target.value,
      },
      this.onUpdateImmediately
    );
  };

  endEdit = () => {
    const {defaultValue, digits, max, min, parseFunc} = this.props;

    let value = defaultValue;

    if (this.state.value) {
      value = parseFunc(this.state.value);
    }

    if (isNaN(value)) {
      value = defaultValue;
    }

    if (max) {
      value = Math.min(value, max);
    }

    if (min) {
      value = Math.max(value, min);
    }

    this.setState({
      value: formatNumber(value, digits),
    });

    this.props.onChange(value);
  };

  render() {
    const {autoFocus, className, narrow, placeholder, wide} = this.props;

    let width = '4.5em';
    if (wide) {
      width = '6em';
    }
    if (narrow) {
      width = '3.25em';
    }

    return (
      <input
        type="text"
        className={classcat(['number', className])}
        style={{width}}
        value={this.state.value}
        onKeyDown={this.onKeyDown}
        onChange={this.onChange}
        onBlur={this.endEdit}
        placeholder={placeholder}
        autoFocus={autoFocus}
      />
    );
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    const value = nextProps.value === undefined || nextProps.value === null ? nextProps.defaultValue : nextProps.value;

    this.setState({
      value,
    });
  }

  formatInitialValue(value) {
    return formatNumber(value.toString().replace(',', '.'), this.props.digits);
  }
}
