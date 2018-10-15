import PropTypes from 'prop-types';
import React from 'react';

const Margin = ({style, ...props}) => {
  const localStyle = {...style};
  const {v = 0, h = 0, top = 0, right = 0, bottom = 0, left = 0, ...others} = {...props};

  if (v > 0) {
    localStyle.marginTop = v;
    localStyle.marginBottom = v;
  }

  if (h > 0) {
    localStyle.marginLeft = h;
    localStyle.marginRight = h;
  }

  if (top > 0) {
    localStyle.marginTop = top;
  }

  if (right > 0) {
    localStyle.marginRight = right;
  }

  if (bottom > 0) {
    localStyle.marginBottom = bottom;
  }

  if (left > 0) {
    localStyle.marginLeft = left;
  }

  return <div style={style} {...others} />;
};

Margin.propTypes = {
  bottom: PropTypes.number,
  h: PropTypes.number,
  left: PropTypes.number,
  right: PropTypes.number,
  top: PropTypes.number,
  v: PropTypes.number,
};

export default Margin;
