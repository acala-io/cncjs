import s from '../variables';

export const link = `
  color: ${s.color.clickable.default};
  cursor: pointer;
  display: inline-block;
  text-decoration: none;

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
      color: $clickable;
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

  /*
   * 1 - Inherit the color value of the parent element
   */
  svg {
      fill: currentColor; /* 1 */
  }
`;

// .is-disabled,
// .is-disabled:hover {
//     color: $text--lightest;
//     cursor: not-allowed;
//     font-style: italic;
// }
