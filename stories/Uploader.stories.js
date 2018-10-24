import React from 'react';
import {action} from '@storybook/addon-actions';
import {storiesOf} from '@storybook/react';

import backgroundsDecorator from './lib/backgroundsDecorator';

import Uploader from '../src/web/components_new/Uploader';

storiesOf('Components/Uploader', module)
  .addDecorator(backgroundsDecorator)
  .add('Default', () => <Uploader onChange={action('onChange')} />)
  .add('Multiple', () => <Uploader onChange={action('onChange')} multiple />)
  .add('Disabled', () => <Uploader onChange={action('onChange')} disabled />);
