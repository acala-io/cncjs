import React, {PureComponent} from 'react';
import {func} from 'prop-types';

import Controller from './Controller';
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
        <DialogHeader heading={'Settings'} />
        {this.content}
      </Dialog>
    );
  }

  get content() {
    return (
      <div className="text--centered u-padding">
        <Controller
          actions={{
            load: () => {},
            restoreSettings: () => {},
            save: () => {},
            toggleIgnoreErrors: () => {},
          }}
          state={{
            ignoreErrors: true,
          }}
          stateChanged={false}
        />
      </div>
    );
  }
}

export default SettingsModal;
