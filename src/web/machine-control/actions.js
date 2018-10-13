import {createActions} from 'redux-actions';

import API from '../api';

const updateControllers = payload => ({
  payload,
  type: 'CONTROLLERS__SET',
});

export const {refresh} = createActions({
  refresh: () => async dispatch => {
    try {
      // const res = await API.controllers.get();
      const res = await API.mdi.fetch();
      const data = res.body;
      console.log('Received data from controllerActions.refresh()', data);

      dispatch(updateControllers(data));
    } catch (err) {
      console.error(err);
    }
  },
});
