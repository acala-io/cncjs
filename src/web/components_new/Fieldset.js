import React from 'react';
import styled from 'styled-components';
import {arrayOf, node, oneOfType, string} from 'prop-types';

import mixin from '../styles/mixins/';
import s from '../styles/variables';

const FieldsetLabel = styled.label`
    ${mixin.centerX};

    background: ${s.color.background.white};
    color: ${s.color.text.lighter};
    display: inline-block;
    font-weight: ${s.font.weight.normal};
    left: 50%;
    line-height: 1.25;
    margin: 0;
    padding: 0 ${s.size.small};
    position: absolute;
    text-align: center;
    transform: translate(-50%, -100%);
    white-space: nowrap;
}
`;

const StyledFieldset = styled.fieldset`
  border: ${s.border.width.default} solid ${s.color.border.lighter};
  border-radius: ${s.border.radius.large};
  display: block;
  margin-bottom: 0;
  padding: ${s.size.small};
  position: relative;
  width: 100%;

  & + & {
    margin-top: ${s.size.large};
  }
`;

const Fieldset = ({children, label}) => (
  <StyledFieldset>
    <FieldsetLabel>{label}</FieldsetLabel>
    {children}
  </StyledFieldset>
);

Fieldset.propTypes = {
  children: oneOfType([arrayOf(node), node]),
  label: string,
};

export default Fieldset;
