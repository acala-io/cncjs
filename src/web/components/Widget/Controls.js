import classcat from 'classcat';
import React from 'react';

import './index.scss';

const Controls = ({className, ...props}) => <div {...props} className={classcat([className, 'widget-controls'])} />;

export default Controls;
