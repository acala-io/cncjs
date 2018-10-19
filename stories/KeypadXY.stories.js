import React from 'react';
import {storiesOf} from '@storybook/react';
import {action} from '@storybook/addon-actions';
import {withKnobs, select} from '@storybook/addon-knobs/react';

import backgroundsDecorator from './lib/backgroundsDecorator';

import KeypadXY from '../src/web/widgets/Axes/components/KeypadXY';

const mockState = {
  axes: ['x', 'y', 'z'],
  canClick: false,
  connection: {},
  controller: {},
  jog: {},
  machinePosition: {},
  mdi: {},
  modal: {},
  units: 'mm',
  workPosition: {},
  workflow: {},
  clicked: null,
};

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

storiesOf('Components/KeypadXY', module)
  .addDecorator(withKnobs)
  .addDecorator(backgroundsDecorator)
  .add('Default with knobs', () => {
    const clicked = select(
      'KeyPadButton',
      {
        default: 'default',
        'x-plus': 'x-plus',
        'x-minus': 'x-minus',
        'y-plus': 'y-plus',
        'y-minus': 'y-minus',
        'x-plus-y-plus': 'x-plus-y-plus',
        'x-plus-y-minus': 'x-plus-y-minus',
        'x-minus-y-plus': 'x-minus-y-plus',
        'x-minus-y-minus': 'x-minus-y-minus',
      },
      null
    );

    return <KeypadXY state={mockState} actions={mockActions} clicked={clicked} />;
  });
