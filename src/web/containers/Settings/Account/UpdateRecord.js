import {get} from 'lodash';
import classcat from 'classcat';
import PropTypes from 'prop-types';
import React, {PureComponent} from 'react';

import i18n from '../../../lib/i18n';
import * as validations from '../../../lib/validations';

import Modal from '../../../components/Modal';
import Space from '../../../components/Space';
import ToggleSwitch from '../../../components/ToggleSwitch';
import {Form, Input} from '../../../components/Validation';
import {ToastNotification} from '../../../components/Notifications';

class UpdateRecord extends PureComponent {
  static propTypes = {
    actions: PropTypes.object,
    state: PropTypes.object,
  };

  fields = {
    enabled: null,
    name: null,
    newPassword: null,
    oldPassword: null,
  };

  get value() {
    const {name, oldPassword, password: newPassword} = this.form.getValues();

    return {
      enabled: Boolean(get(this.fields.enabled, 'state.checked')),
      name,
      newPassword,
      oldPassword,
    };
  }
  render() {
    const {state, actions} = this.props;
    const {modal} = state;
    const {alertMessage, changePassword = false, enabled, name} = modal.params;

    return (
      <Modal size="sm" onClose={actions.closeModal}>
        <Modal.Header>
          <Modal.Title>
            {i18n._('My Account')}
            <Space width="8" />
            &rsaquo;
            <Space width="8" />
            {i18n._('Update')}
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
                <label>{i18n._('Account status')}</label>
                <div>
                  <ToggleSwitch
                    ref={node => {
                      this.fields.enabled = node;
                    }}
                    size="sm"
                    checked={enabled}
                  />
                </div>
              </div>
              <div className="form-group">
                <label>{i18n._('Username')}</label>
                <Input
                  ref={node => {
                    this.fields.name = node;
                  }}
                  type="text"
                  name="name"
                  value={name}
                  className="form-control form-control short"
                  validations={[validations.required]}
                />
              </div>
              <div className="form-group">
                <label>{changePassword ? i18n._('Old Password') : i18n._('Password')}</label>
                <div className="clearfix">
                  <Input
                    ref={node => {
                      this.fields.oldPassword = node;
                    }}
                    type="password"
                    name="oldPassword"
                    className={classcat(['form-control', {'pull-left': !changePassword}, 'form-control', 'short'])}
                    validations={changePassword ? [validations.required] : []}
                    disabled={!changePassword}
                  />
                  {!changePassword && (
                    <button
                      type="button"
                      className="btn btn-default pull-left"
                      onClick={() => {
                        actions.updateModalParams({changePassword: true});
                      }}
                    >
                      {i18n._('Change Password')}
                    </button>
                  )}
                </div>
              </div>
              {changePassword && (
                <div className="form-group">
                  <label>{i18n._('New Password')}</label>
                  <Input
                    ref={node => {
                      this.fields.newPassword = node;
                    }}
                    type="password"
                    name="password"
                    className="form-control form-control short"
                    validations={[validations.required, validations.password]}
                  />
                </div>
              )}
              {changePassword && (
                <div className="form-group">
                  <label>{i18n._('Confirm Password')}</label>
                  <Input
                    type="password"
                    name="confirm"
                    value=""
                    className="form-control form-control short"
                    validations={[validations.required]}
                  />
                </div>
              )}
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

                const {id} = modal.params;
                const {enabled, name, newPassword, oldPassword} = this.value;
                const forceReload = true;

                actions.updateRecord(id, {enabled, name, newPassword, oldPassword}, forceReload);
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

export default UpdateRecord;
