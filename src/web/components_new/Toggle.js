/*
 * Renders a labeled toggle for switching between two values.
 * Uses a checkbox input in the background.
 *
 * Usage:
 * <Toggle value={aBoolVariable} onClick={() => { alert('toggled'); }}/>
 */

import React from 'react';
import styled from 'styled-components';
import {bool, func, object, string} from 'prop-types';

import Hint from './Hint';

import mixin from '../styles/mixins/';

const ToggleFrame = styled.label`
  border-radius: ${({theme}) => theme.border.radius.pill};
  box-sizing: content-box;
  cursor: pointer;
  display: inline-block;
  height: 1.8em;
  margin: 0;
  padding: 0;
  position: relative;
  vertical-align: middle;
  width: 4em;
`;

const ToggleLabels = styled.div`
  background-color: ${({theme}) => theme.color.background.default};
  border-radius: inherit;
  font-size: ${({theme}) => theme.font.size.tiny};
  height: 100%;
  position: relative;
  text-transform: uppercase;
  transition: ${({theme}) => theme.transition.time.medium} opacity ${({theme}) => theme.transition.style.dynamic};

  :before,
  :after {
    ${mixin.centerY};

    color: ${({theme}) => theme.color.text.lighter};
    font-size: 1.25em !important;
    line-height: 1.5;
    transition: inherit;
  }

  // 'off' text
  :before {
    content: '${({textOff}) => textOff}';
    right: 1em;
  }

  // 'on' text
  :after {
    content: '${({textOn}) => textOn}';
    left: 1.3em;
    opacity: 0;
  }
`;

const ToggleHandle = styled.span`
  background-color: ${({theme}) => theme.color.clickable.default};
  border-radius: ${({theme}) => theme.border.radius.circle};
  height: 1.5em;
  left: 0.15em;
  position: absolute;
  top: 0.15em;
  transition: ${({theme}) => theme.transition.time.fast} transform ${({theme}) => theme.transition.style.dynamic};
  width: 1.5em;

  :hover {
    background-color: ${({theme}) => theme.color.clickable.highlight};
  }
`;

const ToggleHint = styled(Hint)`
  display: inline-block;
  padding-left: ${({theme}) => theme.size.small};
  vertical-align: middle;
`;

const ToggleInput = styled.input.attrs({type: 'checkbox'})`
  ${mixin.pinTopLeft};

  opacity: 0 !important;

  :checked ~ ${ToggleLabels} {
    :before {
      opacity: 0;
    }

    :after {
      opacity: 1;
    }
  }

  /*
   * 1 - ((ToggleLabels width) - (ToggleHandle width) - 2 * (ToggleHandle left)) = 4 - 1.5 - 0.3 = 2.2
   */
  :checked ~ ${ToggleHandle} {
    transform: translate3d(2.2em, 0, 0); /* 1 */
  }
`;

const StyledToggle = styled.div`
  display: inline-block;

  ${({disabled}) =>
    disabled &&
    `
      &,
      &:hover {
        ${ToggleFrame},
        ${ToggleHandle} {
          cursor: not-allowed;
        }

        ${ToggleHandle} {
          background: ${({theme}) => theme.color.background.darker};
        }
      }
  `};

  /*
   * 1 - Add some spacing between Toggle and label text, if Toggle is wrapped in a label
   */
  label > & {
    margin-right: ${({theme}) => theme.size.small};
  }
`;

const Toggle = ({
  className = '',
  hint = '',
  disabled = false,
  onClick,
  style = {},
  textOff = 'off',
  textOn = 'on',
  value,
}) => (
  <StyledToggle className={className} style={style} disabled={disabled}>
    <ToggleFrame>
      <ToggleInput
        checked={value}
        onChange={e => {
          if (disabled) {
            e.preventDefault();
            return;
          }

          onClick();
        }}
        disabled={disabled}
      />
      <ToggleLabels textOn={textOn} textOff={textOff} />
      <ToggleHandle />
    </ToggleFrame>
    {hint && <ToggleHint>{hint}</ToggleHint>}
  </StyledToggle>
);

Toggle.propTypes = {
  className: string,
  disabled: bool,
  hint: string,
  onClick: func,
  style: object,
  textOff: string,
  textOn: string,
  value: bool,
};

export default Toggle;
