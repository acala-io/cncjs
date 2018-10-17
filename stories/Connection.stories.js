import React from 'react';
import {storiesOf} from '@storybook/react';
import {action} from '@storybook/addon-actions';

import backgroundsDecorator from './lib/backgroundsDecorator';

import Connection from '../src/web/widgets/Connection';

const mockActions = {
  changeController: action('changeController'),
  clearAlert: action('clearAlert'),
  handleClosePort: action('handleClosePort'),
  handleOpenPort: action('handleOpenPort'),
  handleRefresh: action('handleRefresh'),
  onChangeBaudRateOption: action('onChangeBaudRateOption'),
  onChangePortOption: action('onChangePortOption'),
  toggleAutoReconnect: action('toggleAutoReconnect'),
  toggleHardwareFlowControl: action('toggleHardwareFlowControl'),
  toggleMinimized: action('toggleMinimized'),
};

const mockState = {
  alertMessage: '',
  autoReconnect: true,
  baudRates: [250000, 115200, 57600, 38400, 19200, 9600, 2400],
  connected: false,
  connecting: false,
  connection: {
    rtscts: false,
    serial: {
      baudRate: '19200',
      path: '',
    },
    socket: {
      host: '',
      port: 23,
    },
    type: 'serial',
  },
  controller: {
    availableControllers: ['Grbl', 'Marlin', 'TinyG', 'Smoothie'],
    type: 'Grbl',
  },
  loading: false,
  minimized: true,
  ports: [
    {
      comName: '/dev/tty.Bluetooth-Incoming-Port',
      isOpen: false,
    },
    {
      comName: '/dev/tty.iPhone6Dominik-Wireless',
      isOpen: false,
    },
  ],
};

storiesOf('Widgets/Connection', module)
  .addDecorator(backgroundsDecorator)
  .add('Default', () => <Connection actions={mockActions} state={mockState} widgetId="Connection" />)
  .add('Alert', () => (
    <Connection actions={mockActions} state={{...mockState, alertMessage: 'Attention please!'}} widgetId="Connection" />
  ));
