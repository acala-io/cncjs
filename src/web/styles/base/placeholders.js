import {css} from 'styled-components';

const placeholders = css`
  /*
   * HTML5 placeholders.
   *
   * Grouping the rules for multiple browsers breaks, so we have to keep them separate
   */

  /*
   * 1 - Set line-height explicitly, otherwise it will be misaligned e.g. on iPad
   * 2 - Truncate placeholders with an ellipsis in case they are too long
   * 3 - Accidentally selecting the placeholder text when clicking on something else looks broken
   */
  input::-webkit-input-placeholder,
  textarea::-webkit-input-placeholder {
    color: ${({theme}) => theme.color.text.lighter} !important;
    font-style: italic !important;
    line-height: 1.5; /* 1 */
    text-overflow: ellipsis; /* 2 */
    user-select: none; /* 2 */
  }

  /*
   * 1 - Inherit line-height from parent, otherwise it will be misaligned e.g. on iPad
   * 2 - Required for Firefox
   * 3 - Truncate placeholders with an ellipsis in case they are too long
   * 4 - Accidentally selecting the placeholder text when clicking on something else looks broken
   */
  input::-moz-placeholder,
  textarea::-moz-placeholder {
    color: ${({theme}) => theme.color.text.lighter} !important;
    font-style: italic !important;
    line-height: inherit; /* 1 */
    opacity: 1; /* 2 */
    text-overflow: ellipsis; /* 3 */
    user-select: none; /* 4 */
  }

  /*
   * 1 - Inherit line-height from parent, otherwise it will be misaligned e.g. on iPad
   * 2 - Truncate placeholders with an ellipsis in case they are too long
   * 3 - Accidentally selecting the placeholder text when clicking on something else looks broken
   */
  input:-ms-input-placeholder,
  textarea:-ms-input-placeholder {
    color: ${({theme}) => theme.color.text.lighter} !important;
    font-style: italic !important;
    line-height: inherit; /* 1 */
    text-overflow: ellipsis; /* 2 */
    user-select: none; /* 3 */
  }
`;

export default placeholders;
