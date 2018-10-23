import React from 'react';
import styled from 'styled-components';
import {bool, oneOf, object, string} from 'prop-types';

import mixin from '../styles/mixins/';

const roundedLeft = `
  0 calc(${({theme}) => theme.border.radius.default} - 1px) calc(${({theme}) => theme.border.radius.default} - 1px) 0
`;

const roundedRight = `
  calc(${({theme}) => theme.border.radius.default} - 1px) 0 0 calc(${({theme}) => theme.border.radius.default} - 1px)
`;

const StyledInputAddon = styled.div`
  ${mixin.input};

  align-items: center;
  background: ${({theme}) => theme.color.transparent};
  display: flex;
  font-size: ${({large, theme}) => (large ? theme.font.size.large : 'inherit')};
  justify-content: flex-start;
  max-width: 10em;
  padding: 0;
`;

const Input = styled.input`
  border: 0 none !important;
  border-radius: ${({position}) => (position === 'after' ? roundedRight : roundedLeft)};
  order: ${({position}) => (position === 'after' ? 1 : 2)};
  text-align: ${({isNumber}) => (isNumber ? 'right' : 'left')};

  && {
    width: 4.5em;
    // default: width: 4.5em;
    // wide: width: 3.25em;
    // narrow: width: 3.25em;
  }
`;

const AddOn = styled.div`
  /*
   * 1 - Make sure AddOn does not cover border of wrapper
   */

  background-color: ${({theme}) => theme.color.background.default};
  border-radius: ${({position}) => (position === 'after' ? roundedLeft : roundedRight)};
  color: ${({theme}) => theme.color.text.lighter} !important;
  height: calc(2em - ${({theme}) => theme.border.width.default} - ${({theme}) => theme.border.width.default}); /* 1 */
  line-height: 0.95;
  order: ${({position}) => (position === 'after' ? 2 : 1)};
  padding: 0.5em;
  text-align: center;
  user-select: none;

  &,
  &:hover {
    cursor: default;
  }
`;

const InputAddon = ({className, inputProps, addOn, isNumber = false, large = false, position = 'after', style}) => (
  <StyledInputAddon large={large} className={className} style={style}>
    <Input {...inputProps} position={position} isNumber={isNumber || inputProps.type === 'number'} />
    <AddOn position={position}>{addOn}</AddOn>
  </StyledInputAddon>
);

InputAddon.propTypes = {
  addOn: string.isRequired,
  className: string,
  inputProps: object.isRequired,
  isNumber: bool,
  large: bool,
  position: oneOf(['before', 'after']),
  style: object,
};

export default InputAddon;
