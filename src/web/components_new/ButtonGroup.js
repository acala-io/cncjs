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

import * as React from 'react';
import styled from 'styled-components';

export type Props = {
  className?: string,
  equalWidth?: boolean,
  isDisabled?: boolean,
  onChange: Function,
  optionName: string,
  options: Array<any>,
  selectedValue: number | string,
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

const StyledButtonGroup = styled.div`
  border-radius: ${({theme}) => theme.border.radius.default};
  display: ${({equalWidth}) => (equalWidth ? 'flex' : 'inline-block')};
  white-space: nowrap;
`;

const ButtonGroupButton = styled.label`
  background: ${({theme}) => theme.color.background.white};
  border: ${({theme}) => theme.border.width.default} solid ${({theme}) => theme.color.border.default};
  color: ${({isDisabled, theme}) => (isDisabled ? theme.color.text.default : theme.color.clickable.default)};
  cursor: ${({isDisabled}) => (isDisabled ? 'not-allowed' : 'pointer')};
  display: inline-block;
  ${({equalWidth}) => equalWidth && 'flex: 1'};
  font-weight: ${({theme}) => theme.font.weight.default};
  line-height: ${({variant}) => (variant === 'icons' ? 0 : 1)};
  margin: 0;
  min-width: 2em;
  padding-bottom: ${({hasUnits, theme, variant}) =>
    hasUnits || variant === 'icons' ? theme.size.small : theme.size.default};
  padding-left: ${({theme, variant}) => (variant === 'icons' ? theme.size.small : theme.size.default)};
  padding-right: ${({theme, variant}) => (variant === 'icons' ? theme.size.small : theme.size.default)};
  padding-top: ${({hasUnits, theme, variant}) =>
    hasUnits || variant === 'icons' ? theme.size.small : theme.size.default};
  position: relative;
  text-align: center;

  :hover {
    ${({isDisabled}) =>
      !isDisabled &&
      `
          border-color: ${({theme}) => theme.color.clickable.highlight};
          color: ${({theme}) => theme.color.clickable.highlight};
          z-index: ${({theme}) => theme.zIndex.elevated1};
        `};
  }

  :not(:last-child) {
    margin-right: -${({theme}) => theme.border.width.default};
  }

  :first-child {
    border-bottom-left-radius: ${({theme}) => theme.border.radius.default};
    border-top-left-radius: ${({theme}) => theme.border.radius.default};
  }

  :last-child {
    border-bottom-right-radius: ${({theme}) => theme.border.radius.default};
    border-top-right-radius: ${({theme}) => theme.border.radius.default};
  }

  ${({isSelected}) =>
    isSelected &&
    `
        &,
        &:hover {
          background: ${({theme}) => theme.color.background.default};
          border-color: ${({theme}) => theme.color.border.default};
          box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.13);
          color: ${({theme}) => theme.color.text.default};
          cursor: default;
          z-index: ${({theme}) => theme.zIndex.base};
        }
        `};

  input[type='radio'] {
    display: none !important;
  }
`;

const ButtonGroupUnit = styled.div`
  color: ${({theme}) => theme.color.text.lighter};
  font-weight: ${({theme}) => theme.font.weight.normal};
`;

const ButtonGroup = ({
  className,
  equalWidth,
  isDisabled,
  onChange,
  optionName,
  options,
  selectedValue,
  style,
  variant,
}: Props) => {
  const selected = getSelected(selectedValue, options);

  return (
    <StyledButtonGroup className={className} style={style} equalWidth={equalWidth}>
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
          <ButtonGroupButton
            key={value}
            variant={variant}
            hasUnits={Boolean(unit)}
            isSelected={isSelected}
            isDisabled={isDisabled}
            equalWidth={equalWidth}
          >
            <input type="radio" {...radioContext} />
            {label}
            {unit && <ButtonGroupUnit>{unit}</ButtonGroupUnit>}
          </ButtonGroupButton>
        );
      })}
    </StyledButtonGroup>
  );
};

ButtonGroup.defaultProps = {
  className: '',
  isDisabled: false,
};

export default ButtonGroup;
