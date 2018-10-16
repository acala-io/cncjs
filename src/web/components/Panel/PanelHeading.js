import classcat from 'classcat';
import React from 'react';

import './index.scss';

const PanelHeading = ({className, ...props}) => <div className={classcat([className, 'panel-heading'])} {...props} />;

export default PanelHeading;
