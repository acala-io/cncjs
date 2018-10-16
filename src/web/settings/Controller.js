import PropTypes from 'prop-types';
import React, {Fragment, PureComponent} from 'react';

import i18n from '../lib/i18n';

import Toggle from '../components_new/Toggle';

class Controller extends PureComponent {
  static propTypes = {
    actions: PropTypes.object,
    state: PropTypes.object,
    // stateChanged: PropTypes.bool,
  };

  fields = {
    ignoreErrors: null,
  };

  handlers = {
    cancel: () => {
      const {actions} = this.props;
      actions.restoreSettings();
    },
    handleChangeIgnoreErrors: () => {
      const {actions} = this.props;
      actions.toggleIgnoreErrors();
    },
    save: () => {
      const {actions} = this.props;
      actions.save();
    },
  };

  componentDidMount() {
    const {actions} = this.props;
    actions.load();
  }

  render() {
    const {state} = this.props;

    // if (state.api.loading) {
    //   return <FacebookLoading delay={400} zoom={2} style={{margin: '15px auto'}} />;
    // }

    return (
      <Fragment>
        <Toggle value={state.ignoreErrors} handleClick={this.handlers.handleChangeIgnoreErrors} />
        <label>{i18n._('Continue execution when an error is detected in the G-code program')}</label>
        {i18n._(
          'Enabling this option may cause machine damage if you don´t have an Emergency Stop button to prevent a dangerous situation.'
        )}
        {/*
        <div className={"form-actions"}>
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
*/}
      </Fragment>
    );
  }
}

export default Controller;
