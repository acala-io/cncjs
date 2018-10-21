import React, {PureComponent} from 'react';
import {func} from 'prop-types';

import i18n from '../../lib/i18n';

import Padding from '../../components_new/Padding';
import {Dialog, DialogHeader} from '../../components_new/Dialog';

class ConnectionModal extends PureComponent {
  static propTypes = {
    onClose: func,
  };

  closeDialog = () => {
    this.props.onClose();
  };

  render() {
    return (
      <Dialog onClose={this.closeDialog} width="extraWide">
        <DialogHeader heading={i18n._('Connection')} />
        <Padding>
          This is just mock content!
          <div className="u-padding-right u-padding-top">
            <div>
              <div className="form-group">
                <label className="control-label">Controller</label>
                <div className="button-group">
                  <label className="button-group__button is-selected">
                    <input type="radio" name="selectedController" value="Grbl" checked="" />
                    Grbl
                  </label>
                  <label className="button-group__button">
                    <input type="radio" name="selectedController" value="Marlin" />
                    Marlin
                  </label>
                  <label className="button-group__button">
                    <input type="radio" name="selectedController" value="Smoothie" />
                    Smoothie
                  </label>
                  <label className="button-group__button">
                    <input type="radio" name="selectedController" value="TinyG" />
                    TinyG
                  </label>
                </div>
              </div>
              <div className="form-group">
                <label className="control-label">Port</label>
                <div className="input-group input-group-sm">
                  <div className="Select sm Select--single">
                    <div className="Select-control">
                      <span className="Select-multi-value-wrapper" id="react-select-2--value">
                        <div className="Select-placeholder">Choose a port</div>
                        <div className="Select-input" role="combobox" />
                      </span>
                      <span className="Select-arrow-zone">
                        <span className="Select-arrow" />
                      </span>
                    </div>
                  </div>
                  <div className="input-group-btn">
                    <button type="button" className="btn btn-default" name="btn-refresh" title="Refresh">
                      <i className="fa fa-refresh" />
                    </button>
                  </div>
                </div>
              </div>
              <div className="form-group">
                <label className="control-label">Baud rate [kilobaud]</label>
                <div className="button-group">
                  <label className="button-group__button">
                    <input type="radio" name="selectedBaudRate" value="2400" />
                    2.4
                  </label>
                  <label className="button-group__button">
                    <input type="radio" name="selectedBaudRate" value="9600" />
                    9.6
                  </label>
                  <label className="button-group__button is-selected">
                    <input type="radio" name="selectedBaudRate" value="19200" checked="" />
                    19.2
                  </label>
                  <label className="button-group__button">
                    <input type="radio" name="selectedBaudRate" value="38400" />
                    38.4
                  </label>
                  <label className="button-group__button">
                    <input type="radio" name="selectedBaudRate" value="57600" />
                    57.6
                  </label>
                  <label className="button-group__button">
                    <input type="radio" name="selectedBaudRate" value="115200" />
                    115.2
                  </label>
                  <label className="button-group__button">
                    <input type="radio" name="selectedBaudRate" value="250000" />
                    250
                  </label>
                </div>
              </div>
              <div className="form-group">
                <div className="toggle">
                  <label className="toggle__frame">
                    <input type="checkbox" className="toggle__input bot__toggle-input" />
                    <span className="toggle__labels" data-on="on" data-off="off" />
                    <span className="toggle__handle" />
                  </label>
                </div>
                <label className="inline-block">Enable hardware flow control</label>
              </div>
              <div className="form-group">
                <div className="toggle">
                  <label className="toggle__frame">
                    <input type="checkbox" className="toggle__input bot__toggle-input" checked="" />
                    <span className="toggle__labels" data-on="on" data-off="off" />
                    <span className="toggle__handle" />
                  </label>
                </div>
                <label className="inline-block">Connect automatically</label>
              </div>
            </div>
          </div>
        </Padding>
      </Dialog>
    );
  }
}

export default ConnectionModal;
