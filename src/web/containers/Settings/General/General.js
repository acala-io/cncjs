import PropTypes from 'prop-types';
import React, {PureComponent} from 'react';
import {get} from 'lodash';

import i18n from '../../../lib/i18n';

import FormActions from '../../../components_new/FormActions';
import LoadingIndicator from '../../../components_new/LoadingIndicator';
import Select from '../../../components_new/Select';
import Toggle from '../../../components_new/Toggle';
import SettingsRow from '../SettingsRow';

class General extends PureComponent {
  static propTypes = {
    actions: PropTypes.object,
    state: PropTypes.object,
    stateChanged: PropTypes.bool,
  };

  fields = {
    checkForUpdates: null,
  };

  render() {
    if (this.props.state.api.loading) {
      return <LoadingIndicator message={i18n._('Loading data')} fullScreen />;
    }

    return (
      <form>
        {this.settingCheckForUpdates}
        {this.settingLanguage}
        {this.formActions}
      </form>
    );
  }

  get settingLanguage() {
    const lang = get(this.props.state, 'lang', 'en');

    const languageOptions = [
      {label: 'Čeština', value: 'cs'},
      {label: 'Deutsch', value: 'de'},
      {label: 'English (US)', value: 'en'},
      {label: 'Español', value: 'es'},
      {label: 'Français (France)', value: 'fr'},
      {label: 'Italiano', value: 'it'},
      {label: 'Magyar', value: 'hu'},
      {label: 'Nederlands', value: 'nl'},
      {label: 'Português (Brasil)', value: 'pt-br'},
      {label: 'Türkçe', value: 'tr'},
      {label: 'Русский', value: 'ru'},
      {label: '中文 (繁體)', value: 'zh-tw'},
      {label: '中文 (简体)', value: 'zh-cn'},
      {label: '日本語', value: 'ja'},
    ];

    return (
      <SettingsRow
        input={
          <Select
            options={languageOptions}
            selectedOption={lang}
            optionFormatter={o => o.label}
            optionValueMapper={o => o.value}
            onChange={this.handlers.changeLanguage}
          />
        }
        label={i18n._('Language')}
      />
    );
  }

  get settingCheckForUpdates() {
    return (
      <div>
        <label className="label--option">
          <Toggle
            ref={ref => (this.fields.checkForUpdates = ref)}
            value={this.props.state.checkForUpdates}
            onClick={this.handlers.changeCheckForUpdates}
          />
          {i18n._('Automatically check for updates')}
        </label>
      </div>
    );
  }

  get formActions() {
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
    changeCheckForUpdates: () => {
      this.props.actions.toggleCheckForUpdates();
    },
    changeLanguage: event => {
      this.props.actions.changeLanguage(event.target.value);
    },
    save: () => {
      this.props.actions.save();
    },
  };

  componentDidMount() {
    this.props.actions.load();
  }
}

export default General;
