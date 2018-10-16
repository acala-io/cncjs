import classcat from 'classcat';
import React from 'react';
import styles from './index.styl';

const PanelBody = ({className, ...props}) => <div {...props} className={classcat([className, styles.panelBody])} />;

export default PanelBody;
