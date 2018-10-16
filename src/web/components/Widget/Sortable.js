import classcat from 'classcat';
import React from 'react';

import Anchor from '../Anchor';

import styles from './index.styl';

const Sortable = props => {
  const {children, className, style, ...rest} = props;

  return (
    <div className={classcat([className, styles.widgetSortable])} style={style}>
      <Anchor {...rest}>{children}</Anchor>
    </div>
  );
};

export default Sortable;
