import {createActions} from 'redux-actions';

import Alert from './Alert';
import Confirm from './Confirm';
import Prompt from './Prompt';

export const {hide, leave, show} = createActions({
  hide: () => ({}),
  leave: () => ({}),
  show: (dialogName, dialogProps) => ({
    currentDialog: dialogName,
    dialogProps,
  }),
});

export const alert = props => show(Alert, props);
export const confirm = props => show(Confirm, props);
export const prompt = props => show(Prompt, props);
