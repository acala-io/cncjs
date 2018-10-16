import classcat from 'classcat';
import React from 'react';

import styles from './index.styl';

const Title = ({className, ...props}) => <div {...props} className={classcat([className, styles.widgetTitle])} />;

export default Title;
