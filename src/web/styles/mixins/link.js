import {css} from 'styled-components';

export const link = css`
  color: ${({theme}) => theme.color.clickable.default};
  cursor: pointer;
  display: inline-block;
  text-decoration: none;

  /*
   * 1 - I don't like underlining
   */
  :active,
  :focus,
  :hover {
    text-decoration: none; /* 1 */
  }

  /*
   * 1 - Remove box shadows
   * 2 - Remove dotted outline
   */
  :active,
  :focus,
  :visited {
    box-shadow: none; /* 1 */
    outline: 0 none; /* 2 */
  }

  &:visited {
    color: ${({theme}) => theme.color.clickable.default};
  }

  :active,
  :focus,
  :hover,
  :visited:hover {
    color: ${({theme}) => theme.color.clickable.highlight};

    /*
     * 1 - Inherit the color value of the parent element
     */
    svg {
      fill: currentColor; /* 1 */
    }
  }

  svg {
    fill: currentColor;
  }
`;

export const linkDisabled = `
  &,
  &:hover {
    color: ${({theme}) => theme.color.text.lightest};
    cursor: not-allowed;
    font-style: italic;
  }
`;
