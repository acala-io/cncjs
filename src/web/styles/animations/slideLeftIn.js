import {css} from 'styled-components';

const slideLeftIn = css`
  @keyframes slideLeftIn {
    from {
      transform: translate3d(4000px, 0, 0);
    }

    to {
      transform: translate3d(0, 0, 0);
    }
  }

  /*
   * 1 - Keep appearance of last keyframe
   */

  animation: ${({theme}) => theme.transition.time.medium} slideLeftIn ${({theme}) => theme.transition.style.dynamic};
  animation-fill-mode: forwards; /* 1 */
`;

export default slideLeftIn;
