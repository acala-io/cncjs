/* eslint-disable react/forbid-foreign-prop-types */

import React, {Fragment, PureComponent} from 'react';
import {Redirect, withRouter} from 'react-router-dom';

import {trackPage} from '../lib/analytics';

import routes, {defaultRouteLoggedIn, isAuthorizedRoute, isDefinedRoute} from '../routes';

import Error404 from './Errors/Error404';
import Header from './Header';
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

    const currentPage = this.getPage(location, this.props);

    return (
      <Fragment>
        <Header {...this.props} />
        <aside className={styles.sidebar} id="sidebar">
          <Sidebar {...this.props} />
        </aside>
        <div className={styles.main}>
          <div className={styles.content}>{currentPage}</div>
        </div>
      </Fragment>
    );
  }

  getPage(location, props) {
    if (location.pathname === '/workspace') {
      return <Workspace {...this.props} />;
    }

    if (location.pathname.startsWith('/settings')) {
      return <Settings {...this.props} />;
    }

    return <Error404 />;
  }
}

export default withRouter(App);
