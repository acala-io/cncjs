import classcat from 'classcat';
import React from 'react';
import styled from 'styled-components';
import {arrayOf, bool, node, oneOfType, string} from 'prop-types';

import s from '../../styles/variables';

import Flexbox from '../../components_new/Flexbox';
import {Link} from 'react-router-dom';

// const Navbar = styled.div`
//   display: flex;
//   align-items: center;
//   justify-content: space-between;

// const NavItem = styled.div`
//   color: ${s.color.text.lighter};
//   padding-bottom: ${s.globalSpacingUnit.small};
//   padding-right: ${s.globalSpacingUnit.default};
//   padding-top: ${s.globalSpacingUnit.small};
// `;

const NavLink = styled(Link)`
  background: ${s.color.background.clickable};
  padding: ${s.globalSpacingUnit.default};
  text-align: left;
`;

export const NavItem = ({isActive = false, path, title}) => (
  <NavLink to={`/settings/${path}`} className={classcat(['nav-item', {'is-active': isActive}])}>
    {title}
  </NavLink>
);

NavItem.propTypes = {
  isActive: bool,
  path: string,
  title: string,
};

export const Nav = ({children}) => (
  <Flexbox flexDirection="column" justifyContent="space-between" alignItems="center">
    {children}
  </Flexbox>
);

Nav.propTypes = {
  children: oneOfType([node, arrayOf(node)]).isRequired,
};
