import React from 'react';

import {storiesOf} from '@storybook/react';
import {action} from '@storybook/addon-actions';

import Spindle from '../src/web/widgets/Spindle/Spindle';

const mockActions = {
  handleSpindleSpeedChange: action('handleSpindleSpeedChange'),
  toggleMinimized: action('toggleMinimized'),
};

const mockState = {
  canClick: true,
  connection: {
    ident: '',
  },
  controller: {
    modal: {
      spindle: '',
    },
    settings: {},
    state: {},
    type: '',
  },
  spindleSpeed: 1000,
  workflow: {
    state: 'idle',
  },
};

storiesOf('Spindle', module)
  .add('Default', () => <Spindle actions={mockActions} state={mockState} />)
  .add('On (M3)', () => (
    <Spindle
      actions={mockActions}
      state={{
        ...mockState,
        controller: {
          ...mockState.controller,
          modal: {
            spindle: 'M3',
          },
        },
      }}
    />
  ))
  .add('On (M4)', () => (
    <Spindle
      actions={mockActions}
      state={{
        ...mockState,
        controller: {
          ...mockState.controller,
          modal: {
            spindle: 'M4',
          },
        },
      }}
    />
  ));
