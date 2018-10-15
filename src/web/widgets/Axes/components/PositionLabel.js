import PropTypes from 'prop-types';
import React from 'react';

const PositionLabel = ({value}) => {
  value = String(value);

  return (
    <div style={{lineHeight: 1, textAlign: 'right'}}>
      <span style={{color: 'hsl(37, 82%, 59%)', display: 'inline-block', fontSize: 42, verticalAlign: 'top'}}>
        {value.split('.')[0]}
      </span>
      <span style={{display: 'inline-block', fontSize: 28, verticalAlign: 'top'}}>.</span>
      <span style={{color: 'hsl(37, 82%, 59%)', display: 'inline-block', fontSize: 28, verticalAlign: 'top'}}>
        {value.split('.')[1]}
      </span>
    </div>
  );
};

PositionLabel.propTypes = {
  value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
};

export default PositionLabel;