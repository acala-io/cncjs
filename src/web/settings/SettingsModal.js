import React, {PureComponent} from 'react';
import {func} from 'prop-types';

import i18n from '../lib/i18n';

import Padding from '../components_new/Padding';
import Settings from './index';
import {Dialog, DialogHeader} from '../components_new/Dialog';

class SettingsModal extends PureComponent {
  static propTypes = {
    onClose: func,
  };

  closeDialog = () => {
    this.props.onClose();
  };

  render() {
    return (
      <Dialog onClose={this.closeDialog} width="extraWide">
        <DialogHeader heading={i18n._('Settings')} />
        <Padding sides="right">
          <Settings />
        </Padding>
      </Dialog>
    );
  }
}

export default SettingsModal;
