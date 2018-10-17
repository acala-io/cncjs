/* @flow */
/*
 * Renders a button group for switching between multiple options.
 * Uses a radio button input in the background.
 *
 * Usage:
 * <ButtonGroup
 *   optionName="duration"
 *   options={[{value: 24, label: 24}, {value: 36, label: 36}, {value: 48, label: 48}]}
 *   selectedValue={36}
 *   onChange={e => { alert(`Selected ${e}`); }}
 * />
 */

import classcat from 'classcat';
import * as React from 'react';

export type Props = {
  className?: string,
  isDisabled?: boolean,
  onChange: Function,
  optionName: string,
  options: Array<any>,
  selectedValue: number | string,
  selSelector?: string,
  style?: any,
  variant?: 'icons' | 'small' | 'big',
};

function getSelected(selectedValue: number | string, options: Array<any>): number | string {
  let selected = selectedValue;
  if (selectedValue === undefined || selectedValue === null) {
    selected = typeof options[0] === 'object' ? options[0].value : options[0];
  }
  return selected;
}

const ButtonGroup = ({
  className,
  isDisabled,
  onChange,
  optionName,
  options,
  selectedValue,
  selSelector,
  style,
  variant,
}: Props) => {
  const selected = getSelected(selectedValue, options);
  const classes = classcat([
    'button-group',
    {
      'button-group--big': variant === 'big',
      'button-group--icons': variant === 'icons',
      'button-group--small': variant === 'small',
      'is-disabled': isDisabled,
    },
    className,
  ]);

  return (
    <div className={classes} style={style} data-sel-selector={selSelector}>
      {options.map(o => {
        let label;
        let value;
        let unit;

        if (typeof o === 'object') {
          value = o.value;
          label = o.label;
          unit = o.unit ? o.unit : null;
        } else {
          value = o;
          label = o;
        }

        const isSelected = value === selected;
        const radioContext = {
          checked: isSelected,
          defaultValue: value,
          name: optionName,
          onChange: e => (isDisabled ? false : onChange(e.target.value)),
        };

        return (
          <label
            key={value}
            className={classcat([
              'button-group__button',
              {
                'has-units': Boolean(unit),
                'is-selected': isSelected,
              },
            ])}
          >
            <input type="radio" {...radioContext} />
            {label}
            {unit && <div className="button-group__unit">{unit}</div>}
          </label>
        );
      })}
    </div>
  );
};

ButtonGroup.defaultProps = {
  className: '',
  isDisabled: false,
};

export default ButtonGroup;
