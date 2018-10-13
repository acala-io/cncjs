import React from 'react';
import TaskbarButton from './TaskbarButton';

const Taskbar = ({children, style, ...props}) => (
  <div {...props} style={style}>
    {children}
  </div>
);

Taskbar.Button = TaskbarButton;

export default Taskbar;
