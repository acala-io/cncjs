import React from 'react';
import styled from 'styled-components';

const AxisLabel = styled(props => <div {...props} />)`
  // @include center--xy;
  // color: transparentize($text--inverse, 0.4);
  // font-size: $font-size--huge;

  left: 50%;
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
  color: rgba(255, 255, 255, 0.6);
  font-size: 2rem;
`;

export default AxisLabel;
