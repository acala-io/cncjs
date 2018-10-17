import React from 'react';
import styled from 'styled-components';

import s from '../../../styles/variables';

const AxisLabel = styled(props => <div {...props} />)`
  // @include center--xy;
  left: 50%;
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);

  color: rgba(255, 255, 255, 0.5); // transparentize(s.color.text.inverse, 0.4);
  font-size: ${s.font.size.huge};
`;

export default AxisLabel;
