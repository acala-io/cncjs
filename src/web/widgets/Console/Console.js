import PropTypes from 'prop-types';
import React, {PureComponent} from 'react';

import i18n from '../../lib/i18n';

import Terminal from './Terminal';

class Console extends PureComponent {
  static propTypes = {
    actions: PropTypes.object,
    state: PropTypes.object,
  };

  terminal = null;

  render() {
    const {actions, state} = this.props;
    const {connection} = state;

    if (!connection.ident) {
      return <div className="no-serial-connection">{i18n._('No serial connection')}</div>;
    }

    return (
      <Terminal
        ref={ref => {
          if (ref) {
            this.terminal = ref;
          }
        }}
        cols={state.terminal.cols}
        rows={state.terminal.rows}
        cursorBlink={state.terminal.cursorBlink}
        scrollback={state.terminal.scrollback}
        tabStopWidth={state.terminal.tabStopWidth}
        onData={actions.onTerminalData}
      />
    );
  }
}

export default Console;
