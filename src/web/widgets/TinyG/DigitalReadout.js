import classcat from 'classcat';
import PropTypes from 'prop-types';
import React from 'react';

import styles from './index.styl';

const DigitalReadout = props => {
  const {children, label, value} = props;

  return (
    <div className={classcat(['row no-gutters', styles.dro])}>
      <div className="col col-xs-1">
        <div className={styles.droLabel}>{label}</div>
      </div>
      <div className="col col-xs-2">
        <div className={classcat([styles.well, styles.droDisplay])}>{value}</div>
      </div>
      <div className="col col-xs-9">
        <div className={styles.droBtnGroup}>
          <div className="input-group input-group-sm">
            <div className="input-group-btn">{children}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

DigitalReadout.propTypes = {
  children: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.node), PropTypes.node]).isRequired,
  label: PropTypes.string,
  value: PropTypes.string,
};

export default DigitalReadout;