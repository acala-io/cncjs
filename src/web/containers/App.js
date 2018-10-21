/* eslint-disable react/forbid-foreign-prop-types */

import React, {PureComponent} from 'react';
import {Redirect, withRouter} from 'react-router-dom';

import {trackPage} from '../lib/analytics';

import {defaultRouteLoggedIn, isAuthorizedRoute, isDefinedRoute} from '../routes';

import AppLayout from '../layouts/AppLayout';

import Error404 from './Errors/Error404';
import Header from '../machine-control/Header';
import Workspace from './Workspace';

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

  getPage(location) {
    if (location.pathname === '/workspace') {
      return (
        <AppLayout>
          <Header />
          <Workspace {...this.props} />;
        </AppLayout>
      );
    }

    if (location.pathname === '/login') {
      // TODO: add <BlankLayout>
      return <div {...this.props} />;
    }

    return <Error404 />;
  }
}

export default withRouter(App);
