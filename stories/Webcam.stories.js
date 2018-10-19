import React from 'react';
import {storiesOf} from '@storybook/react';
import {action} from '@storybook/addon-actions';

import backgroundsDecorator from './lib/backgroundsDecorator';

import WebcamWidget from '../src/web/widgets/Webcam';

const mockActions = {
  closeModal: action('closeModal'),
  openModal: action('openModal'),
  toggleFullscreen: action('toggleFullscreen'),
  toggleMinimized: action('toggleMinimized'),
  toggleModalGroups: action('toggleModalGroups'),
  toggleQueueReports: action('toggleQueueReports'),
  toggleStatusReports: action('toggleStatusReports'),
  updateModalParams: action('updateModalParams'),
};

const mockState = {
  canClick: true,
  connection: {
    ident: '',
  },
  controller: {
    settings: {},
    state: {},
    type: '',
  },
  isFullscreen: false,
  isReady: true,
  minimized: false,
  modal: {
    name: 'MODAL_NONE',
    params: {},
  },
  panel: {
    modalGroups: {
      expanded: false,
    },
    queueReports: {
      expanded: false,
    },
    statusReports: {
      expanded: false,
    },
  },
};

storiesOf('Widgets/Webcam', module)
  .addDecorator(backgroundsDecorator)
  .add('Default', () => <WebcamWidget actions={mockActions} state={mockState} widgetId="Webcam" />);
