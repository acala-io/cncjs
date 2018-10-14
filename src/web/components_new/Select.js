/*
 * Styled select component.
 *
 * Usage:
 * <Select
 *   options={['one', 'two', 'three']}
 *   selectedOption={'two'}
 *   onChange={e => alert(e.target.value)}
 * />
 *
 * <Select
 *   options={[{type: 'animal', name: 'dog'}, {type: 'animal', name: 'cat'}, {type: 'plant', name: 'tree'}]}
 *   groupOptionsBy="type"
 *   selectedOption={{type: 'animal', name: 'dog'}}
 *   onChange={e => alert(e.target.value)}
 *  />
 */

import classcat from 'classcat';
import groupBy from 'lodash/groupBy';
import React from 'react';
import {array, bool, func, number, object, oneOfType, string} from 'prop-types';

const renderOptions = (options, optionClasses, optionFormatter, optionValueMapper) =>
  Object.keys(options).map(k => {
    const v = options[k];

    return (
      <option key={k} value={optionValueMapper(v, k)} className={classcat([optionClasses])}>
        {optionFormatter(v, k)}
      </option>
    );
  });

const selectContent = (groupOptionsBy, options, optionClasses, optionFormatter, optionValueMapper) => {
  if (groupOptionsBy) {
    const groupedOptions = groupBy(options, o => o[groupOptionsBy]);

    return Object.keys(groupedOptions).map(g => {
      const o = groupedOptions[g];

      if (!g) {
        return renderOptions(o, optionClasses, optionFormatter, optionValueMapper);
      }

      return (
        <optgroup key={g} label={g}>
          {renderOptions(o, optionClasses, optionFormatter, optionValueMapper)}
        </optgroup>
      );
    });
  }

  return renderOptions(options, optionClasses, optionFormatter, optionValueMapper);
};

const Select = ({
  disabled = false,
  groupOptionsBy = '',
  options,
  onChange,
  optionClasses = '',
  optionFormatter = v => v,
  optionValueMapper = v => v,
  selectClasses = '',
  selectedOption,
}) => {
  const value = selectedOption || options[0];

  return (
    <div className={classcat(['styled-select', selectClasses, {'is-disabled': disabled}])}>
      <select value={value} onChange={onChange} disabled={disabled}>
        {selectContent(groupOptionsBy, options, optionClasses, optionFormatter, optionValueMapper)}
      </select>
    </div>
  );
};

Select.propTypes = {
  disabled: bool,
  groupOptionsBy: string,
  onChange: func.isRequired,
  optionClasses: string,
  optionFormatter: func,
  options: oneOfType([array, object]).isRequired,
  optionValueMapper: func,
  selectClasses: string,
  selectedOption: oneOfType([string, number]),
};

export default Select;
