import PropTypes from 'prop-types';
import React, {PureComponent} from 'react';

import i18n from '../../lib/i18n';

import defaultState from '../../store_old/defaultState';
import store from '../../store_old';

import Modal from '../../components/Modal';
import Space from '../../components/Space';
import {Button} from '../../components/Buttons';

class RestoreDefaults extends PureComponent {
  static propTypes = {
    actions: PropTypes.object,
  };

  render() {
    const {actions} = this.props;

    return (
      <Modal size="xs" onClose={actions.closeModal}>
        <Modal.Header>
          <Modal.Title>
            {i18n._('Workspace')}
            <Space width="8" />
            &rsaquo;
            <Space width="8" />
            {i18n._('Restore Defaults')}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>{i18n._('Are you sure you want to restore the default settings?')}</Modal.Body>
        <Modal.Footer>
          <Button onClick={actions.closeModal}>{i18n._('Cancel')}</Button>
          <Button
            btnStyle="danger"
            onClick={() => {
              // Reset to default state
              store.state = defaultState;

              // Persist data locally
              store.persist();

              // Refresh
              window.location.reload();
            }}
          >
            {i18n._('Restore Defaults')}
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }
}

export default RestoreDefaults;
