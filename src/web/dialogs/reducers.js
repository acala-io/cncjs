import {handleActions} from 'redux-actions';

import {hide, leave, show} from './actions';

const getInitialState = () => ({
  currentDialog: null,
  dialogProps: null,
  leaving: false,
});

export default handleActions(
  {
    [hide]: () => getInitialState(),
    [leave]: state => ({
      ...state,
      leaving: true,
    }),
    [show]: (state, {payload: {currentDialog, dialogProps}}) => ({
      ...state,
      currentDialog,
      dialogProps,
      leaving: getInitialState().leaving,
    }),
  },
  getInitialState()
);
