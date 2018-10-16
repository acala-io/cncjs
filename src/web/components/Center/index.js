import classcat from 'classcat';
import PropTypes from 'prop-types';
import React from 'react';

import './index.scss';

const Center = ({className, horizontal, stretched, vertical, ...props}) => (
  <div
    {...props}
    className={classcat([
      className,
      {
        horizontal: Boolean(horizontal),
        stretched: Boolean(stretched),
        vertical: Boolean(vertical),
      },
    ])}
  />
);

Center.propTypes = {
  horizontal: PropTypes.bool,
  stretched: PropTypes.bool,
  vertical: PropTypes.bool,
};

Center.defaultProps = {
  horizontal: false,
  stretched: false,
  vertical: false,
};

export default Center;
