/*
 * Textarea.
 *
 * A lot of form styles were taken from https://github.com/ireade/formhack
 * in so far as they are not already part of
 * https://github.com/necolas/normalize.css/blob/master/normalize.css
 */

import {css} from 'styled-components';

import {transparentize} from '../../lib/color';

const textarea = css`
  /*
   * 1 - Limit width to some 13 words, for optimal readability
   * 2 - Prevent spacing at bottom related to 'display: inline-block;'
   */

  textarea {
    appearance: none;
    background-color: ${({theme}) => transparentize(theme.color.background.whiet, 0.08)};
    border-radius: ${({theme}) => theme.border.radius.default};
    border: ${({theme}) => theme.border.width.default} solid ${({theme}) => theme.color.border.default};
    box-shadow: none;
    max-width: ${({long}) => (long ? 'none' : '19em')}; /* 1 */
    min-height: 10em;
    padding: 0.5em;
    resize: vertical;
    transition: border-color ${({theme}) => theme.transition.time.fast} ease-in-out;
    vertical-align: top; /* 2 */
    width: 100%;

    :hover,
    :active,
    :focus {
      border-color: ${({theme}) => theme.color.clickable.highlight};
      outline: none;
    }

    &[disabled] {
      cursor: not-allowed;
    }
  }
`;

export default textarea;
