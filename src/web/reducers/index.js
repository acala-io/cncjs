import {combineReducers} from 'redux';

import dialogs from '../dialogs/reducers';
import {reducer as flash} from './flash';

export default combineReducers({
  dialogs,
  flash,
});
