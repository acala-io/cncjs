import React from 'react';
import styled from 'styled-components';

import s from '../../../styles/variables';

const WebcamOn = styled(props => <div {...props} />)`
  background-color: ${s.color.background.slightlyOffBlack};
  border-bottom-left-radius: calc(${s.border.radius.large} - 1px);
  border-bottom-right-radius: calc(${s.border.radius.large} - 1px);
  min-height: 240px;
  overflow: hidden;
  position: relative;
  text-align: center;
  width: 100%;
`;

export default WebcamOn;
