import styled from 'styled-components';

import s from '../styles/variables';

const WidgetHeaderButton = styled.div`
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

export default WidgetHeaderButton;
