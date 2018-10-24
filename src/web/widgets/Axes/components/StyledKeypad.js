import styled from 'styled-components';

import {darken} from '../../../lib/color';

const StyledKeypad = styled.div`
  position: relative;

  svg.keypad-image {
    display: inline-block;
    filter: drop-shadow(1.5px 2px ${({theme}) => darken(theme.color.clickable.default, 0.21)});
    height: 200px;
    width: auto;

    &.tilted--x-plus {
      transform: perspective(400px) rotateY(1deg);
      transform-origin: 0 50%;
    }

    &.tilted--x-minus {
      transform: perspective(400px) rotateY(-1deg);
      transform-origin: 100% 50%;
    }

    &.tilted--y-plus {
      transform: perspective(400px) rotateX(-1deg);
      transform-origin: 50% 0;
    }

    &.tilted--y-minus {
      transform: perspective(400px) rotateX(1deg);
      transform-origin: 50% 100%;
    }

    &.tilted--x-plus-y-plus {
      transform: perspective(400px) rotateX(-1deg) rotateY(1deg);
      transform-origin: 0;
    }

    &.tilted--x-plus-y-minus {
      transform: perspective(400px) rotateX(-1deg) rotateY(-1deg);
      transform-origin: 0 100%;
    }

    &.tilted--x-minus-y-plus {
      transform: perspective(400px) rotateX(1deg) rotateY(1deg);
      transform-origin: 100% 0;
    }

    &.tilted--x-minus-y-minus {
      transform: perspective(400px) rotateX(1deg) rotateY(-1deg);
      transform-origin: 100% 100%;
    }

    .keypad-image__button {
      fill: url(#svg-radial-gradient--darker) ${({theme}) => theme.color.clickable.default};
    }

    .keypad-image__button--inner {
      fill: url(#svg-radial-gradient) ${({theme}) => theme.color.clickable.default};
      filter: url(#svg-dropshadow);
    }

    // FIXME:
    &.keypad-image--z {
      .keypad-image__button {
        fill: url(#svg-radial-gradient) ${({theme}) => theme.color.clickable.default};
        filter: none;
      }
    }

    .keypad-image__arrow {
      fill: ${({theme}) => darken(theme.color.clickable.default, 0.05)};
      filter: url(#svg-dropshadow--inset);
    }
  }

  .keypad-button__wrapper {
    bottom: 0;
    left: 0;
    position: absolute;
    right: 0;
    top: 0;
  }

  .keypad-button {
    cursor: pointer;
    flex-grow: 1;
  }
`;

export default StyledKeypad;
