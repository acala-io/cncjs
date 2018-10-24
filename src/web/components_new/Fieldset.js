import React from 'react';
import styled from 'styled-components';
import {arrayOf, node, oneOfType, string} from 'prop-types';

import mixin from '../styles/mixins/';

const Legend = styled.legend`
    ${mixin.centerX};

    background: ${({theme}) => theme.color.background.white};
    color: ${({theme}) => theme.color.text.lighter};
    display: inline-block;
    font-weight: ${({theme}) => theme.font.weight.normal};
    font: inherit;
    left: 50%;
    line-height: 1.25;
    margin: 0;
    padding: 0 ${({theme}) => theme.size.small};
    position: absolute;
    text-align: center;
    transform: translate(-50%, -100%);
    white-space: nowrap;

    :hover,
    :active,
    :focus {
      outline: none;
    }
}
`;

const StyledFieldset = styled.fieldset`
  border: ${({theme}) => theme.border.width.default} solid ${({theme}) => theme.color.border.lighter};
  border-radius: ${({theme}) => theme.border.radius.large};
  display: block;
  font: inherit;
  margin-bottom: 0;
  padding: ${({theme}) => theme.size.small};
  position: relative;
  width: 100%;

  :hover,
  :active,
  :focus {
    outline: none;
  }

  & + & {
    margin-top: ${({theme}) => theme.size.large};
  }
`;

const Fieldset = ({children, legend}) => (
  <StyledFieldset>
    <Legend>{legend}</Legend>
    {children}
  </StyledFieldset>
);

Fieldset.propTypes = {
  children: oneOfType([arrayOf(node), node]),
  legend: string,
};

export default Fieldset;
