import PropTypes from 'prop-types';
import React from 'react';

import './index.scss';

const DigitalReadout = props => {
  const {children, label, value} = props;

  return (
    <div className="row no-gutters dro">
      <div className="col col-xs-1">
        <div className="dro-label">{label}</div>
      </div>
      <div className="col col-xs-2">
        <div className="well dro-display">{value}</div>
      </div>
      <div className="col col-xs-9">
        <div className="dro-btn-group">
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
