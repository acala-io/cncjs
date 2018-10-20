import PropTypes from 'prop-types';
import React from 'react';

const Fraction = props => {
  const {denominator, numerator} = props;

  return (
    <span
      style={{
        display: 'inline-block',
        fontSize: '85%',
        textAlign: 'center',
        verticalAlign: '-0.5em',
        whiteSpace: 'nowrap',
      }}
    >
      <span
        style={{
          display: 'block',
          lineHeight: '1em',
          margin: '0 0.1em',
        }}
      >
        {numerator}
      </span>
      <span
        style={{
          height: 1,
          left: -10000,
          overflow: 'hidden',
          position: 'absolute',
          top: 'auto',
          width: 1,
        }}
      >
        /
      </span>
      <span
        style={{
          borderTop: '1px solid',
          display: 'block',
          lineHeight: '1em',
          margin: '0 0.1em',
          minWidth: 16,
        }}
      >
        {denominator}
      </span>
    </span>
  );
};

Fraction.propTypes = {
  denominator: PropTypes.number,
  numerator: PropTypes.number,
};

export default Fraction;
