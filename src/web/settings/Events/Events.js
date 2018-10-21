import PropTypes from 'prop-types';
import React, {PureComponent} from 'react';

import {MODAL_CREATE_RECORD, MODAL_UPDATE_RECORD} from './constants';

import CreateRecord from './CreateRecord';
import UpdateRecord from './UpdateRecord';
import TableRecords from './TableRecords';

class Events extends PureComponent {
  static propTypes = {
    actions: PropTypes.object,
    state: PropTypes.object,
  };

  render() {
    const {actions, state} = this.props;

    return (
      <div>
        {state.modal.name === MODAL_CREATE_RECORD && <CreateRecord state={state} actions={actions} />}
        {state.modal.name === MODAL_UPDATE_RECORD && <UpdateRecord state={state} actions={actions} />}
        <TableRecords state={state} actions={actions} />
      </div>
    );
  }

  componentDidMount() {
    this.props.actions.fetchRecords();
  }
}

export default Events;
