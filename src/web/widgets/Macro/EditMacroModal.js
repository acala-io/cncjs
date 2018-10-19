import chainedFunction from 'chained-function';
import PropTypes from 'prop-types';
import React, {PureComponent} from 'react';
import ReactDOM from 'react-dom';
import {Dropdown, MenuItem} from 'react-bootstrap';
// import {get, uniqueId} from 'lodash';
import {uniqueId} from 'lodash';

import * as validations from '../../lib/validations';
import i18n from '../../lib/i18n';
import insertAtCaret from './insertAtCaret';
// import portal from '../../lib/portal';

import variables from './variables';

import Dialog, {DialogHeader, DialogActions} from '../../components_new/Dialog';
import FormActions from '../../components_new/FormActions';
import Input from '../../components_new/Input';
import Padding from '../../components_new/Padding';
import {Form, Textarea} from '../../components/Validation';

import './index.scss';

class EditMacroModal extends PureComponent {
  static propTypes = {
    content: PropTypes.string,
    id: PropTypes.string,
    name: PropTypes.string,
    onClose: PropTypes.func,
    updateMacro: PropTypes.func,
    updateModalParams: PropTypes.func,
  };

  fields = {
    content: this.props.content,
    name: this.props.name,
  };

  render() {
    const {onClose, updateMacro, updateModalParams} = this.props;
    const {content, id, name} = this.props;

    return (
      <Dialog onClose={onClose}>
        <DialogHeader heading={i18n._('Edit Macro')} />
        <Padding>
          <Form ref={ref => (this.form = ref)} onSubmit={e => e.preventDefault()}>
            <div className="form-group">
              <Input
                className="input--huge input--long"
                placeholder={i18n._('Macro Name')}
                value={name}
                onChange={value => {
                  updateModalParams({
                    content: value,
                  });
                }}
                autoFocus
              />
            </div>
            <div className="form-group">
              {this.macroCommands}
              <Textarea
                ref={ref => (this.fields.content = ref)}
                rows="10"
                name="content"
                value={content}
                validations={[validations.required]}
              />
            </div>
          </Form>
        </Padding>
        <DialogActions>
          <FormActions
            primaryAction={{
              handleClick: chainedFunction(() => {
                this.form.validate(err => {
                  if (err) {
                    return;
                  }

                  const {content, name} = this.value;

                  updateMacro(id, {content, name});
                });
              }, onClose),
              text: i18n._('Save Macro'),
            }}
            secondaryAction={{
              handleClick: onClose,
            }}
          >
            {/*
              <Button
                text={i18n._('Delete')}
                handleClick={() => {
                  const name = get(this.fields.name, 'value');

                  portal(() => (
                    <Modal size="xs" onClose={onClose}>
                      <Modal.Header>
                        <Modal.Title>{i18n._('Delete Macro')}</Modal.Title>
                      </Modal.Header>
                      <Modal.Body>
                        {i18n._('Are you sure you want to delete this macro?')}
                        <p>
                          <strong>{name}</strong>
                        </p>
                      </Modal.Body>
                      <Modal.Footer>
                        <Button onClick={onClose}>{i18n._('No')}</Button>
                        <Button
                          btnStyle="danger"
                          onClick={chainedFunction(() => {
                            actions.deleteMacro(id);
                            onClose();
                          }, onClose)}
                        >
                          {i18n._('Yes')}
                        </Button>
                      </Modal.Footer>
                    </Modal>
                  ));
                }}
                danger
              />
            */}
          </FormActions>
        </DialogActions>
      </Dialog>
    );
  }

  get value() {
    const {content, name} = this.form.getValues();

    return {
      content,
      name,
    };
  }

  get macroCommands() {
    const {updateModalParams} = this.props;

    return (
      <Dropdown
        id="edit-macro-dropdown"
        className="right"
        onSelect={eventKey => {
          // eslint-disable-next-line react/no-find-dom-node
          const textarea = ReactDOM.findDOMNode(this.fields.content).querySelector('textarea');
          if (textarea) {
            insertAtCaret(textarea, eventKey);
          }

          updateModalParams({
            content: textarea.value,
          });
        }}
      >
        <Dropdown.Toggle className="btn-link" style={{boxShadow: 'none'}} useAnchor noCaret>
          <i className="fa fa-plus" /> {i18n._('Macro Variables')} <i className="fa fa-caret-down" />
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
    );
  }
}

export default EditMacroModal;
