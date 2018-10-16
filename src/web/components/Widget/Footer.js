import classcat from 'classcat';
import React from 'react';

import './index.scss';

const Footer = ({className, ...props}) => <div {...props} className={classcat([className, 'widget-footer'])} />;

export default Footer;
