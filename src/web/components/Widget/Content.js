import classcat from 'classcat';
import React from 'react';

import './index.scss';

const Content = ({className, ...props}) => <div {...props} className={classcat([className, 'widget-content'])} />;

export default Content;
