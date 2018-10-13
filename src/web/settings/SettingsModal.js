import React, {PureComponent} from 'react';
import {func, instanceOf, string} from 'prop-types';

import Button from '../components_new/Button';
import Controller from './Controller';
import Hint from '../components_new/Hint';
import {Dialog, DialogActions, DialogHeader} from '../components_new/Dialog';

class SettingsModal extends PureComponent {
  static propTypes = {
    onClose: func,
    // onConfirm: func,
  };

  closeDialog = () => {
    this.props.onClose();
  };

  doSomething = () => {}; // noop

  render() {
    return (
      <Dialog onClose={this.closeDialog} width="extraWide">
        <DialogHeader heading={'Settings'} />
        {this.fields}
        {this.actions}
      </Dialog>
    );
  }

  get fields() {
    return (
      <div className="text--centered u-pr+ u-pb+ u-pl+">
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

  get actions() {
    return (
      <DialogActions>
        <Button text={'Do something'} handleClick={this.doSomething} />
      </DialogActions>
    );
  }
}

export default SettingsModal;
