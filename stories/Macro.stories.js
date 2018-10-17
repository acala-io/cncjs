import React from 'react';
import {storiesOf} from '@storybook/react';
import {action} from '@storybook/addon-actions';

import backgroundsDecorator from './lib/backgroundsDecorator';

import Macro from '../src/web/widgets/Macro/Macro';

const mockActions = {
  addMacro: action('addMacro'),
  closeModal: action('closeModal'),
  deleteMacro: action('deleteMacro'),
  loadMacro: action('loadMacro'),
  openAddMacroModal: action('openAddMacroModal'),
  openEditMacroModal: action('openEditMacroModal'),
  openModal: action('openModal'),
  openRunMacroModal: action('openRunMacroModal'),
  runMacro: action('runMacro'),
  toggleMinimized: action('toggleMinimized'),
  updateMacro: action('updateMacro'),
  updateModalParams: action('updateModalParams'),
};

const mockState = {
  canClick: true,
  connection: {
    ident: '',
  },
  controller: {
    state: {},
    type: '',
  },
  macros: [
    {
      content: 'G21',
      id: 'aa23f86d-2ff3-4a78-8150-b5f63a53b033',
      mtime: 1539630900583,
      name: 'Hello',
    },
  ],
  minimized: false,
  modal: {
    name: 'widgets/macro:MODAL_NONE',
    params: {},
  },
  workflow: {
    state: 'idle',
  },
};

storiesOf('Widgets/Macro', module)
  .addDecorator(backgroundsDecorator)
  .add('Default', () => (
    <div style={{width: 340}}>
      <Macro actions={mockActions} state={mockState} />
    </div>
  ));
