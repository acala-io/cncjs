import React from 'react';
import styled from 'styled-components';

import s from '../styles/variables';

const WidgetHeaderButton = styled(props => <div {...props} />)`
  color: ${s.color.clickable.default};
  cursor: pointer;
  display: inline-block;
  float: right;
  margin-top: -${s.globalSpacingUnit.small};
  padding: ${s.globalSpacingUnit.default};
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

export default WidgetHeaderButton;
