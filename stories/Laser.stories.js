import React from 'react';
import {storiesOf} from '@storybook/react';
import {action} from '@storybook/addon-actions';

import backgroundsDecorator from './lib/backgroundsDecorator';

import Laser from '../src/web/widgets/Laser/Laser';

const mockActions = {
  changeLaserTestDuration: action('changeLaserTestDuration'),
  changeLaserTestMaxS: action('changeLaserTestMaxS'),
  changeLaserTestPower: action('changeLaserTestPower'),
  laserTestOff: action('laserTestOff'),
  laserTestOn: action('laserTestOn'),
  toggleLaserTest: action('toggleLaserTest'),
  toggleMinimized: action('toggleMinimized'),
};

const mockState = {
  canClick: true,
  connection: {
    ident: '',
  },
  controller: {
    modal: {
      coolant: '',
      spindle: '',
    },
    settings: {},
    state: {},
    type: '',
  },
  minimized: false,
  panel: {
    laserTest: {
      expanded: false,
    },
  },
  test: {
    duration: 0,
    maxS: 1000,
    power: 0,
  },
  workflow: {
    state: 'idle',
  },
};

storiesOf('Widgets/Laser', module)
  .addDecorator(backgroundsDecorator)
  .add('Default', () => (
    <div style={{width: 340}}>
      <Laser actions={mockActions} state={mockState} />
    </div>
  ));
