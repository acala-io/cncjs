import PropTypes from 'prop-types';
import React, {PureComponent} from 'react';
import styled from 'styled-components';

import i18n from '../../lib/i18n';

import Hint from '../../components_new/Hint';
import Terminal from './Terminal';

import s from '../../styles/variables';

const NoSerialConnection = styled(Hint)`
  display: block;
  padding: ${s.size.default} ${s.size.default} ${s.size.large};
  text-align: center;
`;

class Console extends PureComponent {
  static propTypes = {
    actions: PropTypes.object,
    state: PropTypes.object,
  };

  terminal = null;

  render() {
    const {actions, state} = this.props;
    const {ident} = state.connection;
    const {cols, rows, cursorBlink, scrollback, tabStopWidth} = state.terminal;
    const {onTerminalData} = actions;

    if (!ident) {
      return <NoSerialConnection>{i18n._('No serial connection')}</NoSerialConnection>;
    }

    return (
      <Terminal
        ref={ref => {
          if (ref) {
            this.terminal = ref;
          }
        }}
        cols={cols}
        rows={rows}
        cursorBlink={cursorBlink}
        scrollback={scrollback}
        tabStopWidth={tabStopWidth}
        onData={onTerminalData}
      />
    );
  }

  // componentDidMount() {
  //   // TODO: it would be nicer to render the Terminal and write 'No serial connection' there
  //   const {connection} = this.props.state;
  //   const {onTerminalData} = this.props.actions;

  //   if (!connection.ident) {
  //     onTerminalData('No serial connection');
  //   }
  // }
}

export default Console;
