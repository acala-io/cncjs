import {combineReducers} from 'redux';

import controllers from '../machine-control/reducers';
import dialogs from '../dialogs/reducers';
import {reducer as flash} from './flash';

export default combineReducers({
  controllers,
  dialogs,
  flash,
});
