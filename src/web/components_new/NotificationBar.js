import React from 'react';
import styled from 'styled-components';
import {arrayOf, node, oneOf, oneOfType} from 'prop-types';

const StyledNotificationBar = styled.div`
  font-weight: ${({theme}) => theme.font.weight.bold};
  padding: ${({theme}) => theme.size.default} ${({theme}) => theme.size.large};
  text-align: center;
  width: 100%;
`;

export const InfoBar = styled(StyledNotificationBar)`
  background-color: ${({theme}) => theme.color.state.attention};
`;

export const WarningBar = styled(StyledNotificationBar)`
  background-color: ${({theme}) => theme.color.state.danger};
  color: ${({theme}) => theme.color.text.inverse};
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
