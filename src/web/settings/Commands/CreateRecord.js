import {get} from 'lodash';
import PropTypes from 'prop-types';
import React, {PureComponent} from 'react';

import i18n from '../../lib/i18n';
import * as validations from '../../lib/validations';

import Modal from '../../components/Modal';
import Space from '../../components/Space';
import ToggleSwitch from '../../components/ToggleSwitch';
import {Form, Input, Textarea} from '../../components/Validation';
import {ToastNotification} from '../../components/Notifications';

class CreateRecord extends PureComponent {
  static propTypes = {
    actions: PropTypes.object,
    state: PropTypes.object,
  };

  fields = {
    commands: null,
    enabled: null,
    title: null,
  };

  get value() {
    const {title, commands} = this.form.getValues();

    return {
      commands,
      enabled: Boolean(get(this.fields.enabled, 'state.checked')),
      title,
    };
  }
  render() {
    const {state, actions} = this.props;
    const {modal} = state;
    const {alertMessage} = modal.params;

    return (
      <Modal size="sm" onClose={actions.closeModal}>
        <Modal.Header>
          <Modal.Title>
            {i18n._('Commands')}
            <Space width="8" />
            &rsaquo;
            <Space width="8" />
            {i18n._('New')}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {alertMessage && (
            <ToastNotification
              style={{margin: '-16px -24px 10px -24px'}}
              type="error"
              onDismiss={() => {
                actions.updateModalParams({alertMessage: ''});
              }}
            >
              {alertMessage}
            </ToastNotification>
          )}
          <Form
            ref={node => {
              this.form = node;
            }}
            onSubmit={event => {
              event.preventDefault();
            }}
          >
            <div className="form-fields">
              <div className="form-group">
                <label>{i18n._('Enabled')}</label>
                <div>
                  <ToggleSwitch
                    ref={node => {
                      this.fields.enabled = node;
                    }}
                    size="sm"
                    checked
                  />
                </div>
              </div>
              <div className="form-group">
                <label>{i18n._('Title')}</label>
                <Input
                  type="text"
                  name="title"
                  value=""
                  className="form-control form-control short"
                  validations={[validations.required]}
                />
              </div>
              <div className="form-group">
                <label>{i18n._('Commands')}</label>
                <Textarea
                  name="commands"
                  value=""
                  rows="5"
                  className="form-control long"
                  validations={[validations.required]}
                />
              </div>
            </div>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <button type="button" className="btn btn-default" onClick={actions.closeModal}>
            {i18n._('Cancel')}
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => {
              this.form.validate(err => {
                if (err) {
                  return;
                }

                const {enabled, title, commands} = this.value;
                actions.createRecord({enabled, title, commands});
              });
            }}
          >
            {i18n._('OK')}
          </button>
        </Modal.Footer>
      </Modal>
    );
  }
}

export default CreateRecord;
