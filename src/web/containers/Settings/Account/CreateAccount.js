import PropTypes from 'prop-types';
import React, {PureComponent} from 'react';
import {get} from 'lodash';

import * as validations from '../../../lib/validations';
import i18n from '../../../lib/i18n';

import FormActions from '../../../components_new/FormActions';
import {Form, Input} from '../../../components/Validation';
import {ToastNotification} from '../../../components/Notifications';

class CreateAccount extends PureComponent {
  static propTypes = {
    actions: PropTypes.object,
    state: PropTypes.object,
  };

  fields = {
    enabled: null,
    name: null,
    password: null,
  };

  get value() {
    const {name, password} = this.form.getValues();

    return {
      enabled: Boolean(get(this.fields.enabled, 'state.checked')),
      name,
      password,
    };
  }

  render() {
    const {actions, state} = this.props;
    const {modal} = state;
    const {alertMessage} = modal.params;

    return (
      <div>
        {alertMessage && (
          <ToastNotification
            type="error"
            onDismiss={() => {
              actions.updateModalParams({alertMessage: ''});
            }}
          >
            {alertMessage}
          </ToastNotification>
        )}
        <Form ref={ref => (this.form = ref)} onSubmit={e => e.preventDefault()}>
          {this.username}
          {this.password}
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
          ref={node => {
            this.fields.name = node;
          }}
          type="text"
          name="name"
          value=""
          className="form-control form-control short"
          validations={[validations.required]}
        />
      </div>
    );
  }

  get password() {
    return (
      <div>
        <div className="form-group">
          <label>{i18n._('Password')}</label>
          <Input
            ref={node => {
              this.fields.password = node;
            }}
            type="password"
            name="password"
            value=""
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

  get formActions() {
    const {closeModal, createRecord} = this.props.actions;

    return (
      <FormActions
        primaryAction={{
          onClick: () => {
            const {enabled, name, password} = this.value;
            createRecord({enabled, name, password});
          },
          text: i18n._('Save Account'),
        }}
        secondaryAction={{
          onClick: closeModal,
        }}
      />
    );
  }
}

export default CreateAccount;
