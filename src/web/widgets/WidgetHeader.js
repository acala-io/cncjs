import React from 'react';
import styled from 'styled-components';
import {arrayOf, func, node, oneOfType, string} from 'prop-types';

import Flexbox from '../components_new/Flexbox';

export const WidgetHeader = ({children}) => (
  <Flexbox flexDirection="row" justifyContent="space-between" alignItems="center">
    {children}
  </Flexbox>
);

WidgetHeader.propTypes = {
  children: oneOfType([arrayOf(node), node]),
};

const StyledName = styled.div`
  color: ${({theme}) => theme.color.text.lighter};
  cursor: pointer;
  font-size: ${({theme}) => theme.font.size.large};
  padding: ${({theme}) => theme.size.small} ${({theme}) => theme.size.default};
  user-select: none;
`;

export const WidgetName = ({name = 'Give me a name!', onClick}) => (
  <StyledName onMouseDown={onClick}>{name}</StyledName>
);

WidgetName.propTypes = {
  name: string,
  onClick: func,
};

export const WidgetHeaderButtons = ({children}) => <div>{children}</div>;

WidgetHeaderButtons.propTypes = {
  children: oneOfType([arrayOf(node), node]),
};

export const WidgetHeaderButton = styled.div`
  color: ${({theme}) => theme.color.clickable.default};
  cursor: pointer;
  display: inline-block;
  padding: ${({theme}) => theme.size.default};
  text-decoration: none;

  svg {
    fill: currentColor;
  }

  :active,
  :focus,
  :visited {
    box-shadow: none;
    outline: 0 none;
  }

  :visited {
    color: ${({theme}) => theme.color.clickable.default};
  }

  :active,
  :focus,
  :hover,
  :visited:hover {
    color: ${({theme}) => theme.color.clickable.highlight};

    svg {
      fill: currentColor;
    }
  }
`;
