import PropTypes from 'prop-types';
import React, {PureComponent} from 'react';

import i18n from '../../lib/i18n';

import Modal from '../../components/Modal';
import Textarea from '../../components_new/Textarea';
import {Button} from '../../components/Buttons';

class RunMacro extends PureComponent {
  static propTypes = {
    actions: PropTypes.object,
    state: PropTypes.object,
  };

  render() {
    const {actions, state} = this.props;
    const {id, name, content} = {...state.modal.params};

    return (
      <Modal size="md" onClose={actions.closeModal}>
        <Modal.Header>
          <Modal.Title>{i18n._('Run Macro')}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div style={{marginBottom: 10}}>
            <label>
              <strong>{name}</strong>
            </label>
            <Textarea rows="10" value={content} readOnly />
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={actions.closeModal}>{i18n._('Cancel')}</Button>
          <Button
            btnStyle="primary"
            onClick={() => {
              actions.runMacro(id, {name});
              actions.closeModal();
            }}
          >
            {i18n._('Run')}
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }
}

export default RunMacro;
