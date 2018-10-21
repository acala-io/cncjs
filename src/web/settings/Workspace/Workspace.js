import PropTypes from 'prop-types';
import React, {PureComponent} from 'react';

import i18n from '../../lib/i18n';
import log from '../../lib/log';
import portal from '../../lib/portal';
import settings from '../../config/settings';

import store from '../../store_old';

import {MODAL_RESTORE_DEFAULTS, MODAL_IMPORT_SETTINGS} from './constants';

import Button from '../../components_new/Button';
import FormActions from '../../components_new/FormActions';
import ImportSettings from './ImportSettings';
import Modal from '../../components/Modal';
import ModalTemplate from '../../components/ModalTemplate';
import RestoreDefaults from './RestoreDefaults';
import Space from '../../components/Space';

class Workspace extends PureComponent {
  static propTypes = {
    actions: PropTypes.object,
    state: PropTypes.object,
  };

  render() {
    const {actions, state} = this.props;

    return (
      <div>
        {state.modal.name === MODAL_RESTORE_DEFAULTS && <RestoreDefaults state={state} actions={actions} />}
        {state.modal.name === MODAL_IMPORT_SETTINGS && <ImportSettings state={state} actions={actions} />}
        <form>
          {this.configurationPreview}
          {this.formActions}
        </form>
      </div>
    );
  }

  fileInput = null;

  handleUploadFile = event => {
    const {actions} = this.props;
    const files = event.target.files;
    const file = files[0];
    const reader = new FileReader();

    reader.onloadend = event => {
      const {result, error} = event.target;

      if (error) {
        log.error(error);
        return;
      }

      let data = null;
      try {
        data = JSON.parse(result) || {};
      } catch (err) {
        // Ignore
      }

      // TODO: Sanitization
      const {version, state} = {...data};
      if (typeof version !== 'string' && typeof state !== 'object') {
        portal(({onClose}) => (
          <Modal size="xs" onClose={onClose}>
            <Modal.Header>
              <Modal.Title>
                {i18n._('Settings')}
                <Space width="8" />
                &rsaquo;
                <Space width="8" />
                {i18n._('Workspace')}
              </Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <ModalTemplate type="error">
                <div>
                  <strong>{i18n._('Import Error')}</strong>
                </div>
                <p>{i18n._('Invalid file format.')}</p>
              </ModalTemplate>
            </Modal.Body>
            <Modal.Footer>
              <Button text={i18n._('Close')} onClick={onClose} />
            </Modal.Footer>
          </Modal>
        ));
        return;
      }

      actions.openModal(MODAL_IMPORT_SETTINGS, {data});
    };

    try {
      reader.readAsText(file);
    } catch (err) {
      // Ignore error
    }
  };

  handleRestoreDefaults = () => {
    this.props.actions.openModal(MODAL_RESTORE_DEFAULTS);
  };

  handleImport = () => {
    this.fileInput.value = null;
    this.fileInput.click();
  };

  handleExport = () => {
    // https://github.com/mholt/PapaParse/issues/175#issuecomment-201308792
    const text = store.getConfig();
    const data = new Blob([text], {
      type: 'text/plain;charset=utf-8;',
    });
    const filename = `${settings.name}-${settings.version}.json`;

    // IE11 & Edge
    if (navigator.msSaveBlob) {
      navigator.msSaveBlob(data, filename);
    } else {
      // In FF link must be added to DOM to be clicked
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(data);
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  get configurationPreview() {
    const text = JSON.stringify({state: store.state, version: settings.version}, null, 2);

    return (
      <pre style={{height: 400, margin: '14px', padding: '7px 14px'}}>
        <code>{text}</code>
      </pre>
    );
  }

  get formActions() {
    return (
      <FormActions
        primaryAction={{
          icon: 'upload',
          onClick: this.handleImport,
          text: i18n._('Import'),
        }}
        secondaryAction={{
          icon: 'download',
          onClick: this.handleExport,
          text: i18n._('Export'),
        }}
      >
        <Button text={i18n._('Restore Defaults')} onClick={this.handleRestoreDefaults} danger />
        <input
          ref={ref => (this.fileInput = ref)}
          type="file"
          style={{display: 'none'}}
          multiple={false}
          onChange={this.handleUploadFile}
        />
      </FormActions>
    );
  }
}

export default Workspace;
