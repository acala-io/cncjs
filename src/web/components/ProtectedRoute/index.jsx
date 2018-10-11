/* eslint-disable import/default, react/forbid-foreign-prop-types, react/jsx-no-bind */

import React from 'react';
import {Route, Redirect, withRouter} from 'react-router-dom';

import log from '../../lib/log';
import user from '../../lib/user';

const ProtectedRoute = ({component: Component, ...rest}) => (
  <Route
    {...rest}
    render={props => {
      if (user.authenticated()) {
        return Component ? <Component {...rest} /> : null;
      }

      const redirectFrom = props.location.pathname;
      const redirectTo = '/login';

      if (redirectFrom === redirectTo) {
        return null;
      }

      log.debug(`Redirect from "${redirectFrom}" to "${redirectTo}"`);

      return (
        <Redirect
          to={{
            pathname: '/login',
            state: {
              from: props.location,
            },
          }}
        />
      );
    }}
  />
);

ProtectedRoute.propTypes = {
  ...withRouter.propTypes,
};

export default ProtectedRoute;
