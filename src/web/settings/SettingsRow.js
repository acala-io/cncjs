import React, {Fragment} from 'react';
import styled from 'styled-components';
import {arrayOf, string, node, oneOfType} from 'prop-types';

import Flexbox from '../components_new/Flexbox';

const Label = styled.div`
  color: ${({theme}) => theme.color.text.lighter};
  padding-bottom: ${({theme}) => theme.size.small};
  padding-right: ${({theme}) => theme.size.default};
  padding-top: ${({theme}) => theme.size.small};
`;

const Value = styled.div`
  padding-bottom: ${({theme}) => theme.size.small};
  padding-left: ${({theme}) => theme.size.default};
  padding-top: ${({theme}) => theme.size.small};
`;

const SettingsRow = ({input, label, value}) => (
  <Fragment>
    <Flexbox flexDirection="row" justifyContent="space-between" alignItems="center" className="u-margin-bottom">
      <Flexbox flexBasis="auto" flexGrow={1} flexShrink={1}>
        <Label>{label}</Label>
      </Flexbox>
      <Flexbox flexBasis="auto" flexGrow={100} flexShrink={0}>
        {input}
      </Flexbox>
      <Flexbox flexBasis="auto" flexGrow={1} flexShrink={1} className="text--right">
        <Value>{value}</Value>
      </Flexbox>
    </Flexbox>
  </Fragment>
);

SettingsRow.propTypes = {
  input: oneOfType([node, arrayOf(node)]).isRequired,
  label: string.isRequired,
  value: oneOfType([string, node, arrayOf(node)]),
};

export default SettingsRow;
