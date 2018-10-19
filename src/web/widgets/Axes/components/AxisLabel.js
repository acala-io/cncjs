import React from 'react';
import styled from 'styled-components';

import s from '../../../styles/variables';

const AxisLabel = styled(props => <div {...props} />)`
  // @include center--xy;
  left: 50%;
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);

  color: rgba(255, 255, 255, 0.34);
  font-size: ${s.font.size.huge};
  font-weight: bold;
`;

export default AxisLabel;
