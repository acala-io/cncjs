import PropTypes from 'prop-types';
import React, {PureComponent} from 'react';

import Accounts from './Accounts';

class Account extends PureComponent {
  static propTypes = {
    actions: PropTypes.object,
    state: PropTypes.object,
  };

  render() {
    const {actions, state} = this.props;

    return <Accounts state={state} actions={actions} />;
  }

  componentDidMount() {
    this.props.actions.fetchRecords();
  }
}

export default Account;
