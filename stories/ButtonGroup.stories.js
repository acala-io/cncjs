import React from 'react';
import {action} from '@storybook/addon-actions';
import {storiesOf} from '@storybook/react';

import backgroundsDecorator from './lib/backgroundsDecorator';

import ButtonGroup from '../src/web/components_new/ButtonGroup';

storiesOf('Components/ButtonGroup', module)
  .addDecorator(backgroundsDecorator)
  .add('Default', () => (
    <ButtonGroup
      optionName="whatever"
      options={[{value: 24, label: 24}, {value: 36, label: 36}, {value: 48, label: 48}]}
      selectedValue={36}
      onChange={action('selected')}
    />
  ))
  .add('With units', () => (
    <ButtonGroup
      optionName="whatever"
      options={[
        {value: 0.01, label: 0.01, unit: 'mm'},
        {value: 0.1, label: 0.1, unit: 'mm'},
        {value: 1, label: 1, unit: 'mm'},
      ]}
      selectedValue={1}
      onChange={action('selected')}
    />
  ));
