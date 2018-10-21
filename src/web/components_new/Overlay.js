import styled from 'styled-components';

import animation from '../styles/animations/';
import mixin from '../styles/mixins/';
import s from '../styles/variables';

const Overlay = styled.div`
  /*
   * 1 - Cover entire viewport
   */

  ${animation.fadeIn}
  ${mixin.pinTopLeftFixed}

  animation-duration: ${s.transition.time.slow};
  background: ${s.color.background.overlay};
  height: 100%; /* 1 */
  width: 100%; /* 1 */
  z-index: ${s.zIndex.topmost1};
`;

export default Overlay;
