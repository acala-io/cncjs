import PropTypes from 'prop-types';
import React, {PureComponent} from 'react';
import ReactDOM from 'react-dom';
import {Dropdown, MenuItem} from 'react-bootstrap';
import {uniqueId} from 'lodash';

import * as validations from '../../lib/validations';
import i18n from '../../lib/i18n';
import insertAtCaret from './insertAtCaret';

import variables from './variables';

import Modal from '../../components/Modal';
import Space from '../../components/Space';
import {Button} from '../../components/Buttons';
import {Form, Input, Textarea} from '../../components/Validation';

import './index.scss';

class AddMacroModal extends PureComponent {
  static propTypes = {
    actions: PropTypes.object,
    state: PropTypes.object,
  };

  fields = {
    content: null,
    name: null,
  };

  get value() {
    const {content, name} = this.form.getValues();

    return {
      content,
      name,
    };
  }

  render() {
    const {actions, state} = this.props;
    const {content = ''} = {...state.modal.params};

    return (
      <Modal size="md" onClose={actions.closeModal}>
        <Modal.Header>
          <Modal.Title>{i18n._('New Macro')}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form
            ref={c => {
              this.form = c;
            }}
            onSubmit={event => {
              event.preventDefault();
            }}
          >
            <div className="form-group">
              <label>{i18n._('Macro Name')}</label>
              <Input
                ref={c => {
                  this.fields.name = c;
                }}
                type="text"
                className="form-control"
                name="name"
                value=""
                validations={[validations.required]}
              />
            </div>
            <div className="form-group">
              <div>
                <label>{i18n._('Macro Commands')}</label>
                <Dropdown
                  id="add-macro-dropdown"
                  className="pull-right"
                  onSelect={eventKey => {
                    // eslint-disable-next-line react/no-find-dom-node
                    const textarea = ReactDOM.findDOMNode(this.fields.content).querySelector('textarea');
                    if (textarea) {
                      insertAtCaret(textarea, eventKey);

                      actions.updateModalParams({
                        content: textarea.value,
                      });
                    }
                  }}
                  pullRight
                >
                  <Dropdown.Toggle className="btn-link" style={{boxShadow: 'none'}} useAnchor noCaret>
                    <i className="fa fa-plus" />
                    <Space width="8" />
                    {i18n._('Macro Variables')}
                    <Space width="4" />
                    <i className="fa fa-caret-down" />
                  </Dropdown.Toggle>
                  <Dropdown.Menu className="macro-variables-dropdown">
                    {variables.map(v => {
                      if (typeof v === 'object') {
                        return (
                          <MenuItem header={v.type === 'header'} key={uniqueId()}>
                            {v.text}
                          </MenuItem>
                        );
                      }

                      return (
                        <MenuItem eventKey={v} key={uniqueId()}>
                          {v}
                        </MenuItem>
                      );
                    })}
                  </Dropdown.Menu>
                </Dropdown>
              </div>
              <Textarea
                ref={c => {
                  this.fields.content = c;
                }}
                rows="10"
                className="form-control"
                name="content"
                value={content}
                validations={[validations.required]}
              />
            </div>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={actions.closeModal}>{i18n._('Cancel')}</Button>
          <Button
            btnStyle="primary"
            onClick={() => {
              this.form.validate(err => {
                if (err) {
                  return;
                }

                const {content, name} = this.value;

                actions.addMacro({
                  content,
                  name,
                });
                actions.closeModal();
              });
            }}
          >
            {i18n._('OK')}
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }
}

export default AddMacroModal;
