import React from 'react';
import styled from 'styled-components';
import {bool, string} from 'prop-types';

import Unit from './Unit';

const StyledDisplayValue = styled.div`
  color: ${({theme}) => theme.color.text.default};
  display: inline-block;
  font-size: ${({large, huge, theme}) => {
    if (huge) {
      return theme.font.size.huge;
    }

    if (large) {
      return theme.font.size.large;
    }

    return 'inherit';
  }};
  font-weight: ${({theme}) => theme.font.weight.normal};
  min-width: 5em;
  text-align: right;
  white-space: nowrap;

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
