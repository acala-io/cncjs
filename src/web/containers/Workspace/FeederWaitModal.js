import chainedFunction from 'chained-function';
import PropTypes from 'prop-types';
import React from 'react';

import controller from '../../lib/controller';
import i18n from '../../lib/i18n';

import Button from '../../components_new/Button';
import Dialog, {DialogHeader, DialogActions} from '../../components_new/Dialog';
import FormActions from '../../components_new/FormActions';

const FeederWaitModal = ({onClose, title}) => (
  <Dialog>
    <DialogHeader>{title}</DialogHeader>
    <p>{i18n._('Waiting for the planner to empty ...')}</p>
    <p>{i18n._('If you don´t want to wait, you can force the planner to stop.')}</p>
    <p>{i18n._('This will cause ... !?')}</p>
    <DialogActions>
      <FormActions>
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

FeederWaitModal.propTypes = {
  onClose: PropTypes.func,
  title: PropTypes.string,
};

export default FeederWaitModal;
