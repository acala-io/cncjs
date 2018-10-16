import classcat from 'classcat';
import PropTypes from 'prop-types';
import React from 'react';

import './index.scss';

const Header = ({fixed, className, ...props}) => (
  <div {...props} className={classcat([className, 'widget-header', {'widget-header-fixed': fixed}])} />
);

Header.propTypes = {
  fixed: PropTypes.bool,
};

Header.defaultProps = {
  fixed: false,
};

export default Header;
