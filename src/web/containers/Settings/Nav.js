import React from 'react';
import styled from 'styled-components';
import {arrayOf, bool, node, oneOfType, string} from 'prop-types';

import s from '../../styles/variables';

import Flexbox from '../../components_new/Flexbox';
import {Link} from 'react-router-dom';

const NavLink = styled(Link)`
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

export const NavItem = ({isActive = false, path, title}) => (
  <NavLink to={`/settings/${path}`} isActive={isActive}>
    {title}
  </NavLink>
);

NavItem.propTypes = {
  isActive: bool,
  path: string,
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
