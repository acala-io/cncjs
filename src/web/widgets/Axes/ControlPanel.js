import PropTypes from 'prop-types';
import React, {PureComponent} from 'react';

import Keypad from './Keypad';
import Panel from './components/Panel';

class ControlPanel extends PureComponent {
  static propTypes = {
    actions: PropTypes.object,
    config: PropTypes.object,
    state: PropTypes.object,
  };

  render() {
    return (
      <Panel>
        <Keypad {...this.props} />
      </Panel>
    );
  }
}

export default ControlPanel;
