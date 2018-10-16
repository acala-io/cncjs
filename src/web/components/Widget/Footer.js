import classcat from 'classcat';
import React from 'react';

import styles from './index.styl';

const Footer = ({className, ...props}) => <div {...props} className={classcat([className, styles.widgetFooter])} />;

export default Footer;
