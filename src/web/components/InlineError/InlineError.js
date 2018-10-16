import classcat from 'classcat';
import React from 'react';

import './InlineError.scss';

const InlineError = ({className, children, ...props}) => (
  <div {...props} className={classcat([className, 'help-block help-block-invalid'])}>
    <i className="tmicon tmicon-warning-circle icon" />
    {children}
  </div>
);

export default InlineError;
