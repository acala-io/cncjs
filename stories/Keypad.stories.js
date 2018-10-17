import React from 'react';
import {storiesOf} from '@storybook/react';
import {action} from '@storybook/addon-actions';

import backgroundsDecorator from './lib/backgroundsDecorator';

import Keypad from '../src/web/widgets/Axes/Keypad';

const mockActions = {
  closeModal: action('closeModal'),
  getJogDistance: action('getJogDistance'),
  jog: action('jog'),
  move: action('move'),
  openModal: action('openModal'),
  saveAxesSettings: action('saveAxesSettings'),
  selectAxis: action('selectAxis'),
  selectStep: action('selectStep'),
  setWorkOffsets: action('setWorkOffsets'),
  stepBackward: action('stepBackward'),
  stepForward: action('stepForward'),
  stepNext: action('stepNext'),
  toggleKeypadJogging: action('toggleKeypadJogging'),
  toggleMDIMode: action('toggleMDIMode'),
  updateModalParams: action('updateModalParams'),
};

const mockState = {
  axes: ['x', 'y', 'z'],
  canClick: false,
  connection: {
    ident: '',
  },
  controller: {
    settings: {},
    state: {},
    type: '',
  },
  jog: {
    axis: '',
    imperial: {
      distances: [],
      step: 16,
    },
    keypad: false,
    metric: {
      distances: [],
      step: 1,
    },
  },
  machinePosition: {
    a: '0.000',
    b: '0.000',
    c: '0.000',
    x: '0.000',
    y: '0.000',
    z: '0.000',
  },
  mdi: {
    commands: [],
    disabled: false,
  },
  modal: {
    name: 'widgets/Axes:MODAL_NONE',
    params: {},
  },
  units: 'mm',
  workflow: {
    state: 'idle',
  },
  workPosition: {
    a: '0.000',
    b: '0.000',
    c: '0.000',
    x: '0.000',
    y: '0.000',
    z: '0.000',
  },
};

storiesOf('Components/Keypad', module)
  .addDecorator(backgroundsDecorator)
  .add('Disabled', () => <Keypad actions={mockActions} state={mockState} />)
  .add('Enabled', () => <Keypad actions={mockActions} state={{...mockState, canClick: true}} />);
