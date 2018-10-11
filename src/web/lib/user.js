import api from '../api';
import store from '../store';

let authenticated = false;

module.exports = {
  authenticated: () => authenticated,
  signin: ({name, password, token}) =>
    new Promise((resolve, reject) => {
      api
        .signin({name, password, token})
        .then(res => {
          const {enabled = false, name = '', token = ''} = {...res.body};

          store.set('session.enabled', enabled);
          store.set('session.token', token);
          store.set('session.name', name);

          // Persist data after successful login to prevent debounced update
          store.persist();

          authenticated = true;

          resolve({
            authenticated,
            token,
          });
        })
        .catch(res => {
          // Do not unset session token so it won't trigger an update to the store
          authenticated = false;

          resolve({
            authenticated,
            token: null,
          });
        });
    }),
  signout: () =>
    new Promise((resolve, reject) => {
      store.unset('session.token');

      authenticated = false;

      resolve();
    }),
};
