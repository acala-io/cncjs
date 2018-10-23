import React from 'react';
import styled from 'styled-components';
import {bool, string} from 'prop-types';

import Unit from './Unit';

import s from '../styles/theme';

const StyledDisplayValue = styled.div`
  color: ${s.color.text.default};
  display: inline-block;
  font-size: ${({large, huge}) => {
    if (huge) {
      return s.font.size.huge;
    }

    if (large) {
      return s.font.size.large;
    }

    return 'inherit';
  }};
  font-weight: ${s.font.weight.normal};
  text-align: right;

  ${Unit} {
    font-size: 0.66em;
  }
`;

const DisplayValue = ({huge, large, unit, value}) => (
  <StyledDisplayValue large={large} huge={huge}>
    {value}
    <Unit>{unit}</Unit>
  </StyledDisplayValue>
);

DisplayValue.propTypes = {
  huge: bool,
  large: bool,
  unit: string.isRequired,
  value: string.isRequired,
};

export default DisplayValue;
