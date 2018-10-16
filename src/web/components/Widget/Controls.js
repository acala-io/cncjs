import classcat from 'classcat';
import React from 'react';

import styles from './index.styl';

const Controls = ({className, ...props}) => <div {...props} className={classcat([className, styles.widgetControls])} />;

export default Controls;
