import classcat from 'classcat';
import PropTypes from 'prop-types';
import React from 'react';

import styles from './index.styl';

const Center = ({className, horizontal, vertical, stretched, ...props}) => (
  <div
    {...props}
    className={classcat([
      className,
      {
        [styles.horizontal]: Boolean(horizontal),
        [styles.vertical]: Boolean(vertical),
        [styles.stretched]: Boolean(stretched),
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
