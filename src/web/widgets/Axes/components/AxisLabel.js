import styled from 'styled-components';

const AxisLabel = styled.div`
  font-size: 28px;
  font-weight: ${props => (props.highlight ? 'bold' : 'normal')};
`;

export default AxisLabel;
