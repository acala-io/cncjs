import chainedFunction from 'chained-function';
import PropTypes from 'prop-types';
import React from 'react';

import controller from '../../lib/controller';
import i18n from '../../lib/i18n';

import Button from '../../components_new/Button';
import Dialog, {DialogHeader, DialogActions} from '../../components_new/Dialog';
import FormActions from '../../components_new/FormActions';

const FeederPausedModal = ({onClose, title}) => (
  <Dialog>
    <DialogHeader>{title}</DialogHeader>
    <p>{i18n._('Click the Continue button to resume execution.')}</p>
    <DialogActions>
      <FormActions
        primaryAction={{
          onClick: chainedFunction(() => {
            controller.command('feeder:start');
          }, onClose),
          text: i18n._('Continue'),
        }}
      >
        <Button
          text={i18n._('Stop Machine Now')}
          onClick={chainedFunction(() => {
            controller.command('feeder:stop');
          }, onClose)}
          danger
        />
      </FormActions>
    </DialogActions>
  </Dialog>
);

FeederPausedModal.propTypes = {
  onClose: PropTypes.func,
  title: PropTypes.string,
};

export default FeederPausedModal;
