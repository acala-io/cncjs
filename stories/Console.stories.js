import React from 'react';
import {storiesOf} from '@storybook/react';
import {action} from '@storybook/addon-actions';

import backgroundsDecorator from './lib/backgroundsDecorator';

import Console from '../src/web/widgets/Console/Console';

const mockActions = {
  clearAll: action('clearAll'),
  onTerminalData: action('onTerminalData'),
  toggleMinimized: action('toggleMinimized'),
};

const mockState = {
  connection: {
    ident: 'asfsf',
    settings: {
      baudRate: '19200',
      path: '',
    },
    type: 'serial',
  },
  isFullscreen: false,
  minimized: true,
  terminal: {
    cols: 254,
    cursorBlink: true,
    rows: 15,
    scrollback: 1000,
    tabStopWidth: 4,
  },
};

storiesOf('Widgets/Console', module)
  .addDecorator(backgroundsDecorator)
  .add('Default', () => <Console actions={mockActions} state={mockState} widgetId="Console" />)
  .add('No Connection', () => (
    <Console
      actions={mockActions}
      state={{
        ...mockState,
        connection: {
          ident: '',
          settings: {},
          type: '',
        },
      }}
      widgetId="Console"
    />
  ));
