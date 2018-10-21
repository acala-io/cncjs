import api from '../api';
import store from '../store_old';

let authenticated = false;

export default {
  authenticated: () => authenticated,
  signin: ({name, password, token}) =>
    new Promise(resolve => {
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
        .catch(() => {
          // Do not unset session token so it won't trigger an update to the store
          authenticated = false;

          resolve({
            authenticated,
            token: null,
          });
        });
    }),
  signout: () =>
    new Promise(resolve => {
      store.unset('session.token');

      authenticated = false;

      resolve();
    }),
};
