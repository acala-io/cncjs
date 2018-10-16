import classcat from 'classcat';
import React from 'react';

import './index.scss';

const Title = ({className, ...props}) => <div {...props} className={classcat([className, 'widget-title'])} />;

export default Title;
