import chainedFunction from 'chained-function';
import React from 'react';
import {func, string} from 'prop-types';

import i18n from '../../lib/i18n';

import Dialog, {DialogHeader, DialogActions} from '../../components_new/Dialog';
import FormActions from '../../components_new/FormActions';

const LoadMacroModal = ({onClose, id, loadMacro, name}) => (
  <Dialog onClose={onClose}>
    <DialogHeader heading={i18n._('Load Macro')} />

    {i18n._('Are you sure you want to load this macro?')}
    <p>
      <strong>{name}</strong>
    </p>
    <DialogActions>
      <FormActions
        primaryAction={{
          onClick: chainedFunction(() => {
            loadMacro(id, {name});
          }, onClose),
          text: i18n._('Load Macro'),
        }}
        secondaryAction={{
          onClick: onClose,
        }}
        noPad
      />
    </DialogActions>
  </Dialog>
);

LoadMacroModal.propTypes = {
  id: string,
  loadMacro: func,
  name: string,
  onClose: func,
};

export default LoadMacroModal;
