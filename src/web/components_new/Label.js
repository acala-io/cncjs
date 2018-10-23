/*
 * Label component.
 *
 * Usage:
 * <Label>
 *   <Input/>
 * </Label>
 */

import styled from 'styled-components';

const Label = styled.label`
  /*
   * 1 - Prevent text from being selected when clicking on the label
   */
  color: ${({theme}) => theme.color.text.lighter};
  display: block;
  user-select: none; /* 1 */

  /*
   * 1 - Make both input and label display inline-block, if input has label. Requires a wrapper.
   */
  & + input,
  input + & {
    display: inline-block; /* 1 */
  }

  /*
   * 1 - Add some spacing, if label is directly next to input
   */
  & + input,
  & + select {
    margin-left: 0.25em; /* 1 */
  }

  ${({inline}) =>
    inline &&
    `
    display: inline-block;
    vertical-align: top; // Required for IE
  `};

  ${({option, theme}) =>
    option &&
    `
    /*
     * 1 - Give the label text color, if it is applied to a checkbox or radiobutton,
     *     because then the label text holds the actual information,
     *     whereas for a text input, it merely describes the information
     */
    color: ${theme.color.text.default}; /* 1 */
    cursor: pointer;
    font-weight: ${theme.font.weight.normal};

    /*
     * 1 - Links inside of labels should inherit the label color
     */
    a {
      border-bottom: ${theme.border.width.default} solid ${theme.color.clickable.default};
      color: inherit; /* 1 */
      font-weight: inherit;

      &:hover {
        border-bottom-color: ${theme.color.clickable.highlight};
        color: ${theme.color.clickable.highlight};
      }
    }
  `};
`;

Label.defaultProps = {
  inline: false,
  option: false,
};

export default Label;
