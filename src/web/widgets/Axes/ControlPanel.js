import PropTypes from 'prop-types';
import React, {PureComponent} from 'react';

import Keypad from './Keypad';

class ControlPanel extends PureComponent {
  static propTypes = {
    actions: PropTypes.object,
    config: PropTypes.object,
    state: PropTypes.object,
  };

  render() {
    return <Keypad {...this.props} />;
  }
}

export default ControlPanel;
