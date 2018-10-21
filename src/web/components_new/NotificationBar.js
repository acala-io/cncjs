import React from 'react';
import {arrayOf, node, oneOf, oneOfType} from 'prop-types';

import styled from 'styled-components';

import s from '../styles/variables';

const StyledNotificationBar = styled.div`
  font-weight: ${s.font.weight.bold};
  padding: ${s.size.default} ${s.size.large};
  text-align: center;
  width: 100%;
`;

export const InfoBar = styled(StyledNotificationBar)`
  background-color: ${s.color.state.attention};
`;

export const WarningBar = styled(StyledNotificationBar)`
  background-color: ${s.color.state.danger};
  color: ${s.color.text.inverse};
`;

const NotificationBar = ({children, type = 'info'}) => {
  if (type === 'warning') {
    return <WarningBar>{children}</WarningBar>;
  }

  return <InfoBar>{children}</InfoBar>;
};

NotificationBar.propTypes = {
  children: oneOfType([arrayOf(node), node]),
  type: oneOf(['info', 'warning']),
};

export default NotificationBar;
