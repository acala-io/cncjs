import {css} from 'styled-components';

const links = css`
  /*
   * Hyperlinks.
   */

  a {
    color: ${({theme}) => theme.color.clickable.default};
    cursor: pointer;
    display: inline-block;
    text-decoration: none;

    /*
     * 1 - Inherit the color value of the parent element
     */
    svg {
      fill: currentColor; /* 1 */
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

    &.is-disabled,
    &.is-disabled:hover {
      color: ${({theme}) => theme.color.text.lighter};
      cursor: not-allowed;
      font-style: italic;
      font-weight: ${({theme}) => theme.font.weight.normal};
    }
  }
`;

export default links;
