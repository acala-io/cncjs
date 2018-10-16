import classcat from 'classcat';
import React from 'react';
import styles from './InlineError.styl';

const InlineError = ({className, children, ...props}) => (
  <div {...props} className={classcat([className, styles['help-block'], styles['help-block-invalid']])}>
    <i className={classcat(['tmicon', 'tmicon-warning-circle', styles.icon])} />
    {children}
  </div>
);

export default InlineError;
