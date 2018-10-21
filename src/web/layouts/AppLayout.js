import React, {Component} from 'react';
import styled from 'styled-components';
import {bool, node} from 'prop-types';
import {connect} from 'react-redux';

import Dialogs from '../dialogs';
import FlashMessages from '../components_new/FlashMessages';

import s from '../styles/variables';

const StyledAppLayout = styled.div`
  align-items: stretch;
  background-color: ${s.color.background.darkest};
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  min-height: 100.1vh; // force space for scrollbar
  width: 100vw;
`;

const Body = styled.div`
  ${({hasOverlay}) =>
    hasOverlay
      ? `
        filter: blur(5px);
        transition: blur ${s.transition.time.medium};
      `
      : ''};
`;

class AppLayout extends Component {
  static propTypes = {
    children: node.isRequired,
    hasOverlay: bool,
  };

  render() {
    const {children, hasOverlay} = this.props;

    return (
      <StyledAppLayout>
        <FlashMessages />
        <Dialogs />
        <Body hasOverlay={hasOverlay}>{children}</Body>
      </StyledAppLayout>
    );
  }
}

const mapStateToProps = (state, ownProps) => {
  const {currentDialog} = state.dialogs;

  return {
    children: ownProps.children,
    hasOverlay: Boolean(currentDialog),
  };
};

export default connect(mapStateToProps)(AppLayout);
