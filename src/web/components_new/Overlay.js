import styled from 'styled-components';

import animation from '../styles/animations/';
import mixin from '../styles/mixins/';

const Overlay = styled.div`
  /*
   * 1 - Cover entire viewport
   */

  ${animation.fadeIn}
  ${mixin.pinTopLeftFixed}

  animation-duration: ${({theme}) => theme.transition.time.slow};
  background: ${({theme}) => theme.color.background.overlay};
  height: 100%; /* 1 */
  width: 100%; /* 1 */
  z-index: ${({theme}) => theme.zIndex.topmost1};
`;

export default Overlay;
