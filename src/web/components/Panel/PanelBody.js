import classcat from 'classcat';
import React from 'react';

import './index.scss';

const PanelBody = ({className, ...props}) => <div className={classcat([className, 'panel-body'])} {...props} />;

export default PanelBody;
