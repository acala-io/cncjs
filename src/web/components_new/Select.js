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
 *   long
 *  />
 */

import React from 'react';
import styled from 'styled-components';
import {array, bool, func, number, object, oneOfType, string} from 'prop-types';
import {groupBy} from 'lodash';

import helper from '../styles/helpers/';

const Placeholder = styled.option.attrs({
  disabled: true,
  selected: true,
})`
  /*
   * Style a select option to behave like a placeholder in an input.
   *
   * <option disabled selected>
   *   Placeholder text
   * </option>
   */

  color: ${({theme}) => theme.color.text.lighter};
  display: none;
  font-style: italic;
`;

const StyledOption = styled.option`
  :hover,
  :active,
  :focus {
    outline: none;
  }
`;

const renderOptions = (options, optionFormatter, optionValueMapper) =>
  Object.keys(options).map(k => {
    const v = options[k];

    return (
      <StyledOption key={k} value={optionValueMapper(v, k)}>
        {optionFormatter(v, k)}
      </StyledOption>
    );
  });

const selectContent = (groupOptionsBy, options, optionFormatter, optionValueMapper) => {
  if (groupOptionsBy) {
    const groupedOptions = groupBy(options, o => o[groupOptionsBy]);

    return Object.keys(groupedOptions).map(g => {
      const o = groupedOptions[g];

      if (!g) {
        return renderOptions(o, optionFormatter, optionValueMapper);
      }

      return (
        <optgroup key={g} label={g}>
          {renderOptions(o, optionFormatter, optionValueMapper)}
        </optgroup>
      );
    });
  }

  return renderOptions(options, optionFormatter, optionValueMapper);
};

const ActualSelect = styled.select`
  /*
   * 1 - Fix unchangeable border-radius in webkit
   * 2 - Fix weird vertical alignment in webkit
   * 3 - Remove vendor styling to apply custom arrows using a CSS triangle
   * 4 - Remove outline in Firefox
   * 5 - Remove arrows in IE
   */

  -webkit-appearance: none;
  appearance: none; /* 1, 3 */
  background: rgba(255, 255, 255, 0.92);
  border-radius: ${({theme}) => theme.border.radius.default}; /* 1 */
  border: ${({theme}) => theme.border.width.default} solid ${({theme}) => theme.color.border.default};
  box-shadow: none;
  cursor: pointer;
  max-width: ${({long}) => (long ? 'none' : '19em')}; /* 1 */
  min-width: 5em;
  padding: 0.33em 1.66em 0.33em 0.66em; /* 2 */
  transition: border-color ${({theme}) => theme.transition.time.fast} ease-in-out;
  width: 100%;

  :hover,
  :active,
  :focus {
    border-color: ${({theme}) => theme.color.clickable.highlight};
    outline: none;
  }

  :-moz-focusring {
    color: ${({theme}) => theme.color.transparent}; /* 4 */
    text-shadow: 0 0 0 ${({theme}) => theme.color.transparent}; /* 4 */
  }

  ::-ms-expand {
    display: none; /* 5 */
  }

  &[disabled] {
    cursor: not-allowed;

    &,
    :hover {
      border-color: ${({theme}) => theme.color.transparent};
    }
  }

  &[multiple] {
    height: auto;
    min-height: calc(2em + 2px);
    padding: 0;

    option {
      margin: 0;
      padding: 0.5em 0.66em;
    }
  }

  ${({disabled, theme}) =>
    disabled &&
    `
    border-color: ${theme.color.transparent};
    cursor: text;
    padding-left: 0;
    padding-right: 0;
  `};

  ${({large, theme}) =>
    large &&
    `
    font-size: ${theme.font.size.large};
  `};
`;

const StyledSelect = styled.div`
  display: inline-block;
  position: relative;

  :after {
    ${({theme}) => helper.triangle('down', theme.color.border.default, '0.4em')};

    cursor: pointer;
    pointer-events: none;
    position: absolute;
    right: 0.5em;
    top: 1em;
    z-index: ${({theme}) => theme.zIndex.elevated3};
  }

  ${({disabled, theme}) =>
    !disabled &&
    `
    :hover:after {
      border-top-color: ${theme.color.clickable.highlight};
    }
  `};

  ${({large}) =>
    large &&
    `
    font-size: ${({theme}) => theme.font.size.large};
  `};
`;

const Select = ({
  className = '',
  disabled = false,
  groupOptionsBy = '',
  large = false,
  long = false,
  options,
  onChange,
  optionFormatter = v => v,
  optionValueMapper = v => v,
  placeholder = '',
  selectedOption,
  styles = {},
}) => (
  <StyledSelect className={className} styles={styles} disabled={disabled} large={large}>
    <ActualSelect
      value={placeholder || selectedOption || options[0]}
      onChange={onChange}
      disabled={disabled}
      long={long}
      large={large}
    >
      {placeholder && <Placeholder>{placeholder}</Placeholder>}
      {selectContent(groupOptionsBy, options, optionFormatter, optionValueMapper)}
    </ActualSelect>
  </StyledSelect>
);

Select.propTypes = {
  className: string,
  disabled: bool,
  groupOptionsBy: string,
  large: bool,
  long: bool,
  onChange: func.isRequired,
  optionFormatter: func,
  options: oneOfType([array, object]).isRequired,
  optionValueMapper: func,
  placeholder: string,
  selectedOption: oneOfType([string, number]),
  styles: object,
};

export default Select;
