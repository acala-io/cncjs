import React from 'react';
import styled from 'styled-components';
import {arrayOf, bool, func, node, oneOfType, string} from 'prop-types';

import s from '../../styles/variables';
import mixin from '../../styles/mixins/';

import Flexbox from '../../components_new/Flexbox';

const activeStyles = `
  color: ${s.color.text.default};
  cursor: default;
`;

const NavLink = styled.div`
  ${mixin.link}
  background-color: ${({isActive}) => (isActive ? s.color.background.default : s.color.transparent)};
  padding: ${s.size.default};

  ${({isActive}) => (isActive ? activeStyles : '')};
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
