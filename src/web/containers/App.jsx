/* eslint-disable react/forbid-foreign-prop-types */

import React, {PureComponent} from 'react';
import {Redirect, withRouter} from 'react-router-dom';

import Header from './Header';
import Settings from './Settings';
import Sidebar from './Sidebar';
import styles from './App.styl';
import Workspace from './Workspace';
import {trackPage} from '../lib/analytics';

class App extends PureComponent {
  static propTypes = {
    ...withRouter.propTypes,
  };

  render() {
    const {location} = this.props;
    const accepted =
      [
        '/workspace',
        '/settings',
        '/settings/general',
        '/settings/workspace',
        '/settings/account',
        '/settings/controller',
        '/settings/commands',
        '/settings/events',
        '/settings/about',
      ].indexOf(location.pathname) >= 0;

    if (!accepted) {
      return (
        <Redirect
          to={{
            pathname: '/workspace',
            state: {
              from: location,
            },
          }}
        />
      );
    }

    trackPage(location.pathname);

    return (
      <div>
        <Header {...this.props} />
        <aside className={styles.sidebar} id="sidebar">
          <Sidebar {...this.props} />
        </aside>
        <div className={styles.main}>
          <div className={styles.content}>
            <Workspace
              {...this.props}
              style={{
                display: location.pathname !== '/workspace' ? 'none' : 'block',
              }}
            />
            {location.pathname.indexOf('/settings') === 0 && <Settings {...this.props} />}
          </div>
        </div>
      </div>
    );
  }
}

export default withRouter(App);
