import React from 'react';
// import {action} from '@storybook/addon-actions';
import {storiesOf} from '@storybook/react';

import backgroundsDecorator from './lib/backgroundsDecorator';

import FlashMessages from '../src/web/components_new/FlashMessages';

storiesOf('Components/FlashMessages', module)
  .addDecorator(backgroundsDecorator)
  .add('Default', () => <FlashMessages />)
  .add('Multiple', () => <FlashMessages />);
