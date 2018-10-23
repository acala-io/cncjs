import PropTypes from 'prop-types';
import React from 'react';
import styled from 'styled-components';

const MajorValue = styled.span`
  color: ${({theme}) => theme.color.secondary.default};
  display: inline-block;
  font-size: ${({theme}) => theme.font.size.huge};
  vertical-align: top;
`;

const Separator = styled.span`
  color: ${({theme}) => theme.color.secondary.default};
  display: inline-block;
  font-size: ${({theme}) => theme.font.size.large};
  vertical-align: top;
`;

const MinorValue = styled.span`
  color: ${({theme}) => theme.color.secondary.default};
  display: inline-block;
  font-size: ${({theme}) => theme.font.size.large};
  vertical-align: top;
`;

const PositionLabel = ({value}) => {
  const localValue = String(value).split('.');

  return (
    <div style={{lineHeight: 1, textAlign: 'right'}}>
      <MajorValue>{localValue[0]}</MajorValue>
      <Separator>.</Separator>
      <MinorValue>{localValue[1]}</MinorValue>
    </div>
  );
};

PositionLabel.propTypes = {
  value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
};

export default PositionLabel;
