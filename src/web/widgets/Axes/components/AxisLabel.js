import styled from 'styled-components';

import s from '../../../styles/variables';
import mixin from '../../../styles/mixins';

const AxisLabel = styled.div`
  ${mixin.centerXY} color: rgba(255, 255, 255, 0.34);
  font-size: ${s.font.size.large};
  font-weight: bold;
`;

export default AxisLabel;
