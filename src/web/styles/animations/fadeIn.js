import {css} from 'styled-components';

const fadeIn = css`
  @keyframes fadeIn {
    from {
      opacity: 0;
    }

    to {
      opacity: 1;
    }
  }

  animation: ${({theme}) => theme.transition.time.fast} fadeIn ${({theme}) => theme.transition.style.dynamic};
  animation-fill-mode: both;
`;

export default fadeIn;
