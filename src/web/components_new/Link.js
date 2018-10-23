import styled from 'styled-components';

import Icon from './Icon';

import s from '../styles/theme';
import mixin from '../styles/mixins/';

export const Link = styled.div`
  ${mixin.link}
  ${({isDisabled}) => (isDisabled ? mixin.linkDisabled : '')}

  padding: ${s.size.small};
`;

export const LinkIcon = styled(Icon)`
  margin-right: ${s.size.small};
`;
