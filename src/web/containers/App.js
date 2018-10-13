/* eslint-disable react/forbid-foreign-prop-types */

import classcat from 'classcat';
import React, {Fragment, PureComponent} from 'react';
import {Redirect, withRouter} from 'react-router-dom';

import {trackPage} from '../lib/analytics';

import routes, {defaultRouteLoggedIn, isAuthorizedRoute, isDefinedRoute} from '../routes';

import AppLayout from '../layouts/AppLayout';
import Dialogs from '../dialogs';
import FlashMessages from '../components_new/FlashMessages';
import Error404 from './Errors/Error404';
import Header from '../machine-control/Header';
import Settings from './Settings';
import Sidebar from './Sidebar';
import Workspace from './Workspace';

import styles from './App.styl';

class App extends PureComponent {
  static propTypes = {
    ...withRouter.propTypes,
  };

  render() {
    const {location} = this.props;

    if (!isDefinedRoute(location.pathname)) {
      return <Error404 />;
    }

    if (!isAuthorizedRoute(location.pathname)) {
      return (
        <Redirect
          to={{
            pathname: defaultRouteLoggedIn,
            state: {
              from: location,
            },
          }}
        />
      );
    }

    trackPage(location.pathname);

    return this.getPage(location, this.props);
  }

  getPage(location, props) {
    if (location.pathname === '/workspace') {
      return (
        <AppLayout>
          <Header />
          <Workspace {...this.props} />;
        </AppLayout>
      );
    }

    if (location.pathname.startsWith('/settings')) {
      return (
        <AppLayout>
          <Settings {...this.props} />
        </AppLayout>
      );
    }

    return <Error404 />;
  }
}

export default withRouter(App);
