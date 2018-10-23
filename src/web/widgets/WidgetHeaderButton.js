import styled from 'styled-components';

const WidgetHeaderButton = styled.div`
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

export default WidgetHeaderButton;
