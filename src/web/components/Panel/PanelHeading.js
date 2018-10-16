import classcat from 'classcat';
import React from 'react';
import styles from './index.styl';

const PanelHeading = ({className, ...props}) => (
  <div {...props} className={classcat([className, styles.panelHeading])} />
);

export default PanelHeading;
