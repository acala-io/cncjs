import {css} from 'styled-components';

const shakeDialog = css`
  @keyframes shakeDialog {
    from,
    to {
      transform: translate3d(-50%, -50%, 0);
    }

    20%,
    60% {
      transform: translate3d(-55%, -50%, 0);
    }

    40%,
    80% {
      transform: translate3d(-45%, -50%, 0);
    }
  }

  animation: ${({theme}) => theme.transition.time.slow} shakeDialog;
  animation-fill-mode: both;
`;

export default shakeDialog;
