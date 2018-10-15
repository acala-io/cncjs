import ensureArray from 'ensure-array';
import superagent from 'superagent';
import superagentUse from 'superagent-use';

import store from '../store_old';

const bearer = request => {
  const token = store.get('session.token');

  if (token) {
    request.set('Authorization', `Bearer ${token}`);
  }
};

// Modify request headers and query parameters to prevent caching
const noCache = request => {
  const now = Date.now();
  request.set('Cache-Control', 'no-cache');
  request.set('X-Requested-With', 'XMLHttpRequest');

  if (['GET', 'HEAD'].includes(request.method)) {
    // Force requested pages not to be cached by the browser
    // by appending "_={timestamp}" to the GET parameters
    request._query = ensureArray(request._query);
    request._query.push(`_=${now}`);
  }
};

const authrequest = superagentUse(superagent);
authrequest.use(bearer);
authrequest.use(noCache);

export default authrequest;
