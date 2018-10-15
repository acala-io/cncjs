import {createAction} from 'redux-actions';

const DEFAULT_TIMEOUT = 3000;

export const add = createAction('FLASH__ADD');
export const clearAll = createAction('FLASH__CLEAR_ALL');
export const remove = createAction('FLASH__REMOVE');

export const flashMessage = (message, options = {}) => {
  const {props = {}, push = false, timeout = DEFAULT_TIMEOUT, type = 'success'} = options;

  const id = Date.now();

  return dispatch => {
    if (push) {
      dispatch(clearAll());
    }

    dispatch(add({id, message, props, type}));

    if (timeout) {
      setTimeout(() => dispatch(remove({id})), timeout);
    }
  };
};

// Aliases
export const flashSuccessMessage = (message, options) => {
  return flashMessage(
    message,
    {
      ...options,
      type: 'success',
    },
  );
};

export const flashErrorMessage = (message, options) => {
  return flashMessage(
    message,
    {
      ...options,
      type: 'error',
    },
  );
};

export const flashInfoMessage = (message, options) => {
  return flashMessage(
    message,
    {
      ...options,
      type: 'info',
    },
  );
};
