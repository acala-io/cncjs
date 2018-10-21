import React from 'react';
import {storiesOf} from '@storybook/react';

import backgroundsDecorator from './lib/backgroundsDecorator';
import routerDecorator from './lib/routerDecorator';

import Login from '../src/web/containers/Login/Login';

storiesOf('Pages/Login', module)
  .addDecorator(backgroundsDecorator)
  .addDecorator(routerDecorator)
  .add('Default', () => <Login />);
