import React from 'react';
import styled from 'styled-components';
import {arrayOf, bool, func, node, oneOfType, string} from 'prop-types';

import s from '../../styles/variables';

import Flexbox from '../../components_new/Flexbox';

const NavLink = styled.div`
  background-color: ${({isActive}) => (isActive ? s.color.background.default : s.color.transparent)};
  color: ${({isActive}) => (isActive ? s.color.text.default : s.color.clickable.default)} !important;
  cursor: ${({isActive}) => (isActive ? 'default' : 'pointer')};
  padding: ${s.globalSpacingUnit.default};
  text-decoration: none;

  :hover,
  :active,
  :focus {
    text-decoration: none;
  }
`;

export const NavItem = ({isActive = false, onClick, title}) => (
  <NavLink isActive={isActive} onClick={onClick}>
    {title}
  </NavLink>
);

NavItem.propTypes = {
  isActive: bool,
  onClick: func,
  title: string,
};

export const Nav = ({children}) => (
  <Flexbox flexDirection="column" justifyContent="flex-start" alignItems="stretch" style={{width: '100%'}}>
    {children}
  </Flexbox>
);

Nav.propTypes = {
  children: oneOfType([node, arrayOf(node)]).isRequired,
};
