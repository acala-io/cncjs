/* eslint-disable react/forbid-foreign-prop-types */

import React, {Fragment, PureComponent} from 'react';
import {Redirect, withRouter} from 'react-router-dom';

import {trackPage} from '../lib/analytics';

import {defaultRouteLoggedIn, isAuthorizedRoute, isDefinedRoute} from '../routes';

import AppLayout from '../layouts/AppLayout';

import Error404 from './Errors/Error404';
import Header from '../machine-control/Header';
import Workspace from './Workspace';

import GlobalStyles from '../styles/GlobalStyles';

class App extends PureComponent {
  static propTypes = {
    ...withRouter.propTypes,
  };

  render() {
    const {location} = this.props;

    if (!isDefinedRoute(location.pathname)) {
      return (
        <Fragment>
          <GlobalStyles />
          <Error404 />
        </Fragment>
      );
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
    if (location.pathname === '/login') {
      // TODO: add <BlankLayout>
      return (
        <Fragment>
          <GlobalStyles />
          <div {...this.props} />
        </Fragment>
      );
    }

    return (
      <Fragment>
        <GlobalStyles />
        <AppLayout>
          <Header />
          <Workspace {...this.props} />;
        </AppLayout>
      </Fragment>
    );
  }
}

export default withRouter(App);
