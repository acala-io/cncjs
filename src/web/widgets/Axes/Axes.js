import PropTypes from 'prop-types';
import React from 'react';

import DisplayPanel from './DisplayPanel';
import Keypad from './Keypad';
import MDIPanel from './MDIPanel';

const Axes = props => {
  const {actions, config, state} = props;

  const showMDIPanel = !state.mdi.disabled && state.mdi.commands.length > 0;

  return (
    <div>
      <DisplayPanel config={config} state={state} actions={actions} />
      <Keypad config={config} state={state} actions={actions} />
      {showMDIPanel && <MDIPanel config={config} state={state} actions={actions} />}
    </div>
  );
};

Axes.propTypes = {
  actions: PropTypes.object,
  config: PropTypes.object,
  state: PropTypes.object,
};

export default Axes;
