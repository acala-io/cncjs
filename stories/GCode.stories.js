import React from 'react';
import {storiesOf} from '@storybook/react';
import {action} from '@storybook/addon-actions';

import backgroundsDecorator from './lib/backgroundsDecorator';

import Grbl from '../src/web/widgets/Grbl/Grbl';

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

storiesOf('Widgets/GRBL', module)
  .addDecorator(backgroundsDecorator)
  .add('Default', () => (
    <div style={{width: 340}}>
      <Grbl actions={mockActions} state={mockState} />
    </div>
  ))
  .add('Showing modalGroups', () => (
    <div style={{width: 340}}>
      <Grbl
        actions={mockActions}
        state={{
          ...mockState,
          panel: {
            ...mockState.panel,
            modalGroups: {
              expanded: true,
            },
          },
        }}
      />
    </div>
  ))
  .add('Showing queueReports', () => (
    <div style={{width: 340}}>
      <Grbl
        actions={mockActions}
        state={{
          ...mockState,
          panel: {
            ...mockState.panel,
            queueReports: {
              expanded: true,
            },
          },
        }}
      />
    </div>
  ))
  .add('Showing statusReports', () => (
    <div style={{width: 340}}>
      <Grbl
        actions={mockActions}
        state={{
          ...mockState,
          panel: {
            ...mockState.panel,
            statusReports: {
              expanded: true,
            },
          },
        }}
      />
    </div>
  ));
