import PropTypes from 'prop-types';
import React, {PureComponent} from 'react';

import i18n from '../../lib/i18n';

import FormActions from '../../components_new/FormActions';
import Label from '../../components_new/Label';
import LoadingIndicator from '../../components_new/LoadingIndicator';
import Toggle from '../../components_new/Toggle';

class Controller extends PureComponent {
  static propTypes = {
    actions: PropTypes.object,
    state: PropTypes.object,
    stateChanged: PropTypes.bool,
  };

  fields = {
    ignoreErrors: null,
  };

  render() {
    if (this.props.state.api.loading) {
      return <LoadingIndicator message={i18n._('Loading data')} fullScreen />;
    }

    return (
      <form style={{width: '100%'}}>
        {this.settingExceptionHandling}
        {this.formActions}
      </form>
    );
  }

  get settingExceptionHandling() {
    return (
      <div>
        <Label option>
          <Toggle
            ref={ref => (this.fields.ignoreErrors = ref)}
            value={this.props.state.ignoreErrors}
            onClick={this.handlers.handleChangeIgnoreErrors}
          />
          {i18n._('Continue execution when an error is detected in the G-code program')}
        </Label>
        <p>
          <span className="text-warning">
            <i className="fa fa-exclamation-circle" />
          </span>
          <span>
            {i18n._(
              'Enabling this option may cause machine damage if you don´t have an Emergency Stop button to prevent a dangerous situation.'
            )}
          </span>
        </p>
      </div>
    );
  }

  get formActions() {
    if (!this.props.stateChanged) {
      return null;
    }

    return (
      <FormActions
        primaryAction={{
          isDisabled: !this.props.stateChanged,
          onClick: this.handlers.save,
          text: i18n._('Save Changes'),
        }}
        secondaryAction={{
          onClick: this.handlers.cancel,
          text: i18n._('Cancel'),
        }}
      />
    );
  }

  handlers = {
    cancel: () => {
      this.props.actions.restoreSettings();
    },
    handleChangeIgnoreErrors: () => {
      this.props.actions.toggleIgnoreErrors();
    },
    save: () => {
      this.props.actions.save();
    },
  };

  componentDidMount() {
    this.props.actions.load();
  }
}

export default Controller;
