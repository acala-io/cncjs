import classcat from 'classcat';
import React from 'react';

import Anchor from '../Anchor';

import './index.scss';

const Sortable = props => {
  const {children, className, style, ...rest} = props;

  return (
    <div className={classcat([className, 'widget-sortable'])} style={style}>
      <Anchor {...rest}>{children}</Anchor>
    </div>
  );
};

export default Sortable;
