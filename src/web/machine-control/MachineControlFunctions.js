import PropTypes from 'prop-types';
import React, {PureComponent} from 'react';

import controller from '../lib/controller';
import i18n from '../lib/i18n';

import Button from '../components_new/Button';

const cyclestart = () => {
  controller.command('cyclestart');
};

const feedhold = () => {
  controller.command('feedhold');
};

const sleep = () => {
  controller.command('sleep');
};

const unlock = () => {
  controller.command('unlock');
};

const reset = () => {
  controller.command('reset');
};

const MachineControlFunctions = ({}) => (
  <div>
    <Button text={i18n._('Cycle Start')} handleClick={cyclestart} />
    <Button text={i18n._('Feedhold')} handleClick={feedhold} />
    <Button text={i18n._('Sleep')} handleClick={sleep} />
    <Button text={i18n._('Unlock')} handleClick={unlock} />
    <Button text={i18n._('Reset')} handleClick={reset} />
  </div>
);

export default MachineControlFunctions;
