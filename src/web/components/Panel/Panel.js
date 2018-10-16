import classcat from 'classcat';
import React from 'react';

import './index.scss';

const Panel = ({className, ...props}) => <div className={classcat([className, 'panel panel-default'])} {...props} />;

export default Panel;
