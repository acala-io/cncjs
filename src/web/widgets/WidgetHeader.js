import {arrayOf, func, node, oneOfType, string} from 'prop-types';
import React from 'react';
import styled from 'styled-components';

import s from '../styles/variables';

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
  cursor: pointer;
  font-size: ${s.font.size.large};
  padding: ${s.size.small} ${s.size.default};
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
  color: ${s.color.clickable.default};
  cursor: pointer;
  display: inline-block;
  padding: ${s.size.default};
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
    color: ${s.color.clickable.default};
  }

  :active,
  :focus,
  :hover,
  :visited:hover {
    color: ${s.color.clickable.highlight};

    svg {
      fill: currentColor;
    }
  }
`;
