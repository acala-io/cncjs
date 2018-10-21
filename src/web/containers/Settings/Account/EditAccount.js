import {get} from 'lodash';
import classcat from 'classcat';
import PropTypes from 'prop-types';
import React, {PureComponent} from 'react';

import i18n from '../../../lib/i18n';
import * as validations from '../../../lib/validations';

import FormActions from '../../../components_new/FormActions';
import Toggle from '../../../components_new/Toggle';
import {Form, Input} from '../../../components/Validation';
import {ToastNotification} from '../../../components/Notifications';

class EditAccount extends PureComponent {
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

  render() {
    const {updateModalParams} = this.props.actions;
    const {alertMessage} = this.props.state.modal.params;

    return (
      <div>
        {alertMessage && (
          <ToastNotification
            type="error"
            onDismiss={() => {
              updateModalParams({alertMessage: ''});
            }}
          >
            {alertMessage}
          </ToastNotification>
        )}
        <Form ref={ref => (this.form = ref)} onSubmit={e => e.preventDefault()}>
          {this.username}
          {this.password}
          {this.status}
          {this.formActions}
        </Form>
      </div>
    );
  }

  get username() {
    return (
      <div>
        <label>{i18n._('Username')}</label>
        <Input
          ref={ref => (this.fields.name = ref)}
          type="text"
          name="name"
          value=""
          validations={[validations.required]}
        />
      </div>
    );
  }

  get password() {
    const {modal} = this.props.state;
    const {updateModalParams} = this.props.actions;
    const {changePassword = false} = modal.params;

    if (changePassword) {
      return (
        <div>
          <div className="form-group">
            <label>{i18n._('New Password')}</label>
            <Input
              ref={node => (this.fields.newPassword = node)}
              type="password"
              name="password"
              className="form-control form-control short"
              validations={[validations.required, validations.password]}
            />
          </div>
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
        </div>
      );
    }

    return (
      <div>
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
                updateModalParams({changePassword: true});
              }}
            >
              {i18n._('Change Password')}
            </button>
          )}
        </div>
      </div>
    );
  }

  get status() {
    const {modal} = this.props.state;
    const {enabled, id} = modal.params;
    const {updateRecord} = this.props.actions;

    return (
      <Toggle
        ref={node => (this.fields.enabled = node)}
        value={enabled}
        onClick={() => {
          updateRecord(id, {enabled: !enabled});
        }}
      />
    );
  }

  get formActions() {
    const {modal} = this.props.state;
    const {closeModal, updateRecord} = this.props.actions;

    return (
      <FormActions
        primaryAction={{
          onClick: () => {
            this.form.validate(err => {
              if (err) {
                return;
              }

              const {id} = modal.params;
              const {enabled, name, newPassword, oldPassword} = this.value;
              const forceReload = true;

              updateRecord(id, {enabled, name, newPassword, oldPassword}, forceReload);
            });
          },
          text: i18n._('Save Account'),
        }}
        secondaryAction={{
          onClick: closeModal,
        }}
      />
    );
  }

  get value() {
    const {name, oldPassword, password: newPassword} = this.form.getValues();

    return {
      enabled: Boolean(get(this.fields.enabled, 'state.checked')),
      name,
      newPassword,
      oldPassword,
    };
  }
}

export default EditAccount;
