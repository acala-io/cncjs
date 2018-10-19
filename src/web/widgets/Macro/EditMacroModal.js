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
import Space from '../../components/Space';
import {Form, Input, Textarea} from '../../components/Validation';

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
    const {onClose, updateMacro, updateModalParams} = this.props;
    const {id, name, content} = this.props;

    return (
      <Dialog onClose={onClose}>
        <DialogHeader heading={i18n._('Edit Macro')} />
        <Form ref={ref => (this.form = ref)} onSubmit={e => e.preventDefault()}>
          <div className="form-group">
            <label>{i18n._('Macro Name')}</label>
            <Input
              ref={ref => (this.fields.name = ref)}
              type="text"
              className="form-control"
              name="name"
              value={name}
              validations={[validations.required]}
            />
          </div>
          <div className="form-group">
            <div>
              <label>{i18n._('Macro Commands')}</label>
              <Dropdown
                id="edit-macro-dropdown"
                className="pull-right"
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
              ref={ref => (this.fields.content = ref)}
              rows="10"
              className="form-control"
              name="content"
              value={content}
              validations={[validations.required]}
            />
          </div>
        </Form>
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
            noPad
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
}

export default EditMacroModal;
