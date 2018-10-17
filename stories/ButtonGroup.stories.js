import React from 'react';
import {action} from '@storybook/addon-actions';
import {storiesOf} from '@storybook/react';
// import {withKnobs, text} from '@storybook/addon-knobs/react';

import backgroundsDecorator from './lib/backgroundsDecorator';
import screenshotsDecorator from './lib/screenshotsDecorator';

import ButtonGroup from '../src/web/components_new/ButtonGroup';

storiesOf('ButtonGroup', module)
  .addDecorator(backgroundsDecorator)
  .addDecorator(screenshotsDecorator)
  // .addDecorator(withKnobs)
  .add('Default', () => (
    <ButtonGroup
      optionName="whatever"
      options={[{value: 24, label: 24}, {value: 36, label: 36}, {value: 48, label: 48}]}
      selectedValue={36}
      onChange={action('selected')}
    />
  ))
  .add('With units', () => {
    // const selectedValue = text('Selected Value', '1');

    return (
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
    );
  });
