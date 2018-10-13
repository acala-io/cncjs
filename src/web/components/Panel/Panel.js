import classcat from 'classcat';
import React from 'react';

import styles from './index.styl';

const Panel = ({className, ...props}) => (
  <div {...props} className={classcat([className, styles.panel, styles.panelDefault])} />
);

export default Panel;
