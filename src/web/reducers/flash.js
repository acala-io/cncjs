import {handleActions} from 'redux-actions';

import {add, clearAll, remove} from '../actions/flash';

const initialState = {
  messages: [],
};

export const reducer = handleActions(
  {
    [add]: (state, {payload}) => ({
      messages: [...state.messages, payload],
    }),
    [clearAll]: () => ({
      messages: [],
    }),
    [remove]: (state, {payload: {id}}) => ({
      messages: state.messages.filter(m => m.id !== id),
    }),
  },
  initialState
);

// Selectors
export const getFlashMessages = state => state.flash.messages;

export const getSuccessMessages = state => getFlashMessages(state).filter(m => m.type === 'success');
export const getErrorMessages = state => getFlashMessages(state).filter(m => m.type === 'error');
export const getLatestMessage = state => [...getFlashMessages(state)].pop();
