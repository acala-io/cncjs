import {handleActions} from 'redux-actions';

import {} from './actions';

const getInitialState = () => ({
  hello: 'hi',
});

const setControllers = (state, payload) => ({
  ...state,
  ...payload,
});

export default handleActions(
  {
    CONTROLLERS__SET: (state, {payload}) => setControllers(state, payload),
  },
  getInitialState()
);
