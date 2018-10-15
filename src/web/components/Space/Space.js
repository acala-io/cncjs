import React from 'react';
import PropTypes from 'prop-types';

const Space = ({componentClass: Component, width, ...props}) => {
  let localWidth = width;
  if (typeof localWidth === 'string' && localWidth.match(/^\d+$/)) {
    localWidth += 'px';
  }

  props.style = {
    display: 'inline-block',
    width: localWidth,
    ...props.style,
  };
  return <Component {...props} />;
};

Space.propTypes = {
  componentClass: PropTypes.oneOfType([PropTypes.node, PropTypes.string]),
  width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
};

Space.defaultProps = {
  componentClass: 'span',
  width: 0,
};

export default Space;
