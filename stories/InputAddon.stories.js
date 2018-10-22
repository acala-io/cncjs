import React, {Fragment} from 'react';
import {storiesOf} from '@storybook/react';

import backgroundsDecorator from './lib/backgroundsDecorator';

import InputAddon from '../src/web/components_new/InputAddon';

const mockProps = {
  placeholder: '0',
  type: 'text',
  value: 23000,
};

storiesOf('Components/InputAddon', module)
  .addDecorator(backgroundsDecorator)
  .add('Default', () => (
    <Fragment>
      <InputAddon addOn="RPM" inputProps={mockProps} />
      <InputAddon addOn="RPM" inputProps={mockProps} position="after" isNumber />
      <InputAddon addOn="RPM" inputProps={mockProps} position="before" />
    </Fragment>
  ));
