import {css} from 'styled-components';

import s from '../theme';

export const input = css`
  appearance: none;
  background: rgba(255, 255, 255, 0.92);
  border-radius: ${s.border.radius.default};
  border: ${s.border.width.default} solid ${s.color.border.default};
  box-shadow: none;
  display: inline-block;
  font: inherit;
  height: 2em;
  max-width: 19em;
  outline: none;
  padding: 0.5em;
  transition: border-color ${s.transition.time.fast} ease-in-out;
  width: 100%;

  :hover,
  :active,
  :focus {
    border-color: ${s.color.clickable.highlight};
    outline: none;
  }
`;
