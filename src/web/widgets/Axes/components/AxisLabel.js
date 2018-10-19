import React from 'react';
import styled from 'styled-components';

import s from '../../../styles/variables';
import mixin from '../../../styles/mixins';

const AxisLabel = styled(props => <div {...props} />)`
  ${mixin.centerXY} color: rgba(255, 255, 255, 0.34);
  font-size: ${s.font.size.huge};
  font-weight: bold;
`;

export default AxisLabel;
