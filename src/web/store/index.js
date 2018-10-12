import {applyMiddleware, compose, createStore} from 'redux';
import createDebounce from 'redux-debounced';
import logger from 'redux-logger';
import thunk from 'redux-thunk';

import rootReducer from '../reducers/index';

const middlewares = [createDebounce()];

// Add redux logger in dev environment
if (process.env.NODE_ENV === 'development') {
  middlewares.push(logger);
}

const args = [applyMiddleware(...middlewares)];

const store = createStore(rootReducer, compose(...args));

export default store;
