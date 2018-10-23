import {css} from 'styled-components';

const pulsate = css`
  @keyframes pulsate {
    0%,
    80%,
    100% {
      transform: scale(0);
    }

    40% {
      transform: scale(1);
    }
  }

  animation: 1700ms pulsate infinite ease-in-out;
  animation-fill-mode: both;
`;

export default pulsate;
