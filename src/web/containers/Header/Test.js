/* eslint-disable react/prop-types */

import React, {PureComponent} from 'react';
import {connect} from 'react-redux';
import {MenuItem} from 'react-bootstrap';

import i18n from '../../lib/i18n';

import * as dialogs from '../../dialogs/actions';

const Test = ({showAlert}) => {
  return <div onClick={showAlert}>{i18n._('Help')}</div>;
};

const mapStateToProps = state => {
  // const {dialogs} = state;

  return {};
};

const mapDispatchToProps = (state, dispatch, ownProps) => ({
  showAlert: () => {
    dispatch(
      dialogs.alert({
        buttonText: 'ok',
        heading: 'Läuft',
        text: ['Na das klappt ja schon mal.'],
      })
    );
  },
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Test);
