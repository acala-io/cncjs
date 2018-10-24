<<<<<<< HEAD
import React from 'react';
// import {action} from '@storybook/addon-actions';
=======
import React, from 'react';
import {action} from '@storybook/addon-actions';
>>>>>>> 51eadfa4197375c2d25d72074fe211c42ad2fb46
import {storiesOf} from '@storybook/react';

import backgroundsDecorator from './lib/backgroundsDecorator';

import FlashMessages from '../src/web/components_new/FlashMessages';

storiesOf('Components/FlashMessages', module)
  .addDecorator(backgroundsDecorator)
  .add('Default', () => <FlashMessages />)
  .add('Multiple', () => <FlashMessages />);
