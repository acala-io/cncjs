import styled from 'styled-components';
import {bool, number, string} from 'prop-types';

const Textarea = styled.textarea`
  /*
   * 1 - Limit width to some 13 words, for optimal readability
   * 2 - Prevent spacing at bottom related to 'display: inline-block;'
   */

  appearance: none;
  background: rgba(255, 255, 255, 0.92);
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
`;

Textarea.propTypes = {
  autofocus: bool,
  disabled: bool,
  maxlength: number,
  placeholder: string,
  readonly: bool,
  required: bool,
  rows: number,
  soft: bool,
  wrap: bool,
};

export default Textarea;
