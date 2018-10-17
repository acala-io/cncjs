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
      coolant: '',
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
  .add('Default', () => (
    <div style={{width: 340}}>
      <Spindle actions={mockActions} state={mockState} />
    </div>
  ))
  .add('On (M3)', () => (
    <div style={{width: 340}}>
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
    </div>
  ))
  .add('On (M4)', () => (
    <div style={{width: 340}}>
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
    </div>
  ))
  .add('Mist (M7)', () => (
    <div style={{width: 340}}>
      <Spindle
        actions={mockActions}
        state={{
          ...mockState,
          controller: {
            ...mockState.controller,
            modal: {
              coolant: 'M7',
              spindle: 'M3',
            },
          },
        }}
      />
    </div>
  ))
  .add('Flood (M8)', () => (
    <div style={{width: 340}}>
      <Spindle
        actions={mockActions}
        state={{
          ...mockState,
          controller: {
            ...mockState.controller,
            modal: {
              coolant: 'M8',
              spindle: 'M3',
            },
          },
        }}
      />
    </div>
  ));
