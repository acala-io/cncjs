import {css} from 'styled-components';

import {transparentize} from '../../lib/color';

export const input = css`
  appearance: none;
  background-color: ${({theme}) => transparentize(theme.color.background.whiet, 0.08)};
  border-radius: ${({theme}) => theme.border.radius.default};
  border: ${({theme}) => theme.border.width.default} solid ${({theme}) => theme.color.border.default};
  box-shadow: none;
  display: inline-block;
  font: inherit;
  height: 2em;
  max-width: 19em;
  outline: none;
  padding: 0.5em;
  transition: border-color ${({theme}) => theme.transition.time.fast} ease-in-out;
  width: 100%;

  :hover,
  :active,
  :focus {
    border-color: ${({theme}) => theme.color.clickable.highlight};
    outline: none;
  }
`;
