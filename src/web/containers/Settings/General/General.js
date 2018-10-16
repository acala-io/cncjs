import classcat from 'classcat';
import FacebookLoading from 'react-facebook-loading';
import PropTypes from 'prop-types';
import React, {PureComponent} from 'react';
import {get} from 'lodash';

import i18n from '../../../lib/i18n';

import Space from '../../../components/Space';

import styles from './index.styl';

class General extends PureComponent {
  static propTypes = {
    actions: PropTypes.object,
    state: PropTypes.object,
    stateChanged: PropTypes.bool,
  };

  render() {
    const {state, stateChanged} = this.props;
    const lang = get(state, 'lang', 'en');

    if (state.api.loading) {
      return <FacebookLoading delay={400} zoom={2} style={{margin: '15px auto'}} />;
    }

    return (
      <form style={{marginTop: -10}}>
        <div className={styles.formFields}>
          <div className={styles.formGroup}>
            <div className="checkbox">
              <label>
                <input
                  ref={ref => (this.fields.checkForUpdates = ref)}
                  type="checkbox"
                  checked={state.checkForUpdates}
                  onChange={this.handlers.changeCheckForUpdates}
                />
                {i18n._('Automatically check for updates')}
              </label>
            </div>
          </div>
        </div>
        <div className={styles.formFields}>
          <div className={styles.formGroup}>
            <label>{i18n._('Language')}</label>
            <select
              className={classcat(['form-control', styles.formControl, styles.short])}
              value={lang}
              onChange={this.handlers.changeLanguage}
            >
              <option value="cs">Čeština</option>
              <option value="de">Deutsch</option>
              <option value="en">English (US)</option>
              <option value="es">Español</option>
              <option value="fr">Français (France)</option>
              <option value="it">Italiano</option>
              <option value="hu">Magyar</option>
              <option value="nl">Nederlands</option>
              <option value="pt-br">Português (Brasil)</option>
              <option value="tr">Türkçe</option>
              <option value="ru">Русский</option>
              <option value="zh-tw">中文 (繁體)</option>
              <option value="zh-cn">中文 (简体)</option>
              <option value="ja">日本語</option>
            </select>
          </div>
        </div>
        <div className={styles.formActions}>
          <div className="row">
            <div className="col-md-12">
              <button type="button" className="btn btn-default" onClick={this.handlers.cancel}>
                {i18n._('Cancel')}
              </button>
              <button type="button" className="btn btn-primary" disabled={!stateChanged} onClick={this.handlers.save}>
                {state.api.saving ? <i className="fa fa-circle-o-notch fa-spin" /> : <i className="fa fa-save" />}
                <Space width="8" />
                {i18n._('Save Changes')}
              </button>
            </div>
          </div>
        </div>
      </form>
    );
  }

  fields = {
    checkForUpdates: null,
  };

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
