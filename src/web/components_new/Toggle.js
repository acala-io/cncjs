/* @flow */
/*
 * Renders a labeled toggle for switching between two values.
 * Uses a checkbox input in the background.
 *
 * Usage:
 * <Toggle value={aBoolVariable} handleClick={() => { alert('toggled'); }}/>
 */

import classcat from 'classcat';
import * as React from 'react';

export type Props = {
  className?: string,
  handleClick: Function,
  hint?: string,
  isDisabled?: boolean,
  textOff?: string,
  textOn?: string,
  value: boolean,
};

export default class Toggle extends React.Component<Props> {
  static defaultProps = {
    className: '',
    hint: '',
    isDisabled: false,
    textOff: 'off',
    textOn: 'on',
  };

  // eslint-disable-next-line no-undef
  toggleValue = (e: SyntheticEvent<HTMLInputElement>) => {
    const {handleClick, isDisabled} = this.props;

    if (isDisabled) {
      e.preventDefault();
      return;
    }

    handleClick();
  };

  render() {
    const {className, hint, isDisabled, textOff, textOn, value} = this.props;

    return (
      <div className={classcat(['toggle', {'is-disabled': isDisabled}, className])}>
        <label className="toggle__frame">
          <input
            type="checkbox"
            checked={value}
            className="toggle__input bot__toggle-input"
            onChange={this.toggleValue}
            disabled={isDisabled}
          />
          <span className="toggle__labels" data-on={textOn} data-off={textOff} />
          <span className="toggle__handle" />
        </label>
        {}
        {hint ? <dfn className="toggle__hint">{hint}</dfn> : null}
      </div>
    );
  }
}
