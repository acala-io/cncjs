import styled from 'styled-components';

import Icon from './Icon';

import mixin from '../styles/mixins/';

export const Link = styled.div`
  ${mixin.link};
  ${({isDisabled}) => (isDisabled ? mixin.linkDisabled : '')}

  padding: ${({theme}) => theme.size.small};
`;

export const LinkIcon = styled(Icon)`
  margin-right: ${({theme}) => theme.size.small};
`;
