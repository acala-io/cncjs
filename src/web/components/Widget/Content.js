import classcat from 'classcat';
import React from 'react';
import styles from './index.styl';

const Content = ({className, ...props}) => <div {...props} className={classcat([className, styles.widgetContent])} />;

export default Content;
