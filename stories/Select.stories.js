import React, {Fragment} from 'react';
import {action} from '@storybook/addon-actions';
import {storiesOf} from '@storybook/react';

import backgroundsDecorator from './lib/backgroundsDecorator';

import Select from '../src/web/components_new/Select';

storiesOf('Components/Select', module)
  .addDecorator(backgroundsDecorator)
  .add('Default', () => <Select options={['a', 'b', 'c']} onChange={action('onChange')} />)
  .add('Placeholder', () => (
    <Select options={['a', 'b', 'c']} placeholder="Select a value" onChange={action('onChange')} />
  ))
  .add('Disabled', () => (
    <Fragment>
      <Select options={['a', 'b', 'c']} onChange={action('onChange')} />
      <Select options={['a', 'b', 'c']} disabled onChange={action('onChange')} />
    </Fragment>
  ))
  .add('Long', () => <Select options={['a', 'b', 'c']} onChange={action('onChange')} long />)
  .add('Large', () => <Select options={['a', 'b', 'c']} onChange={action('onChange')} large />)
  .add('Long Large', () => <Select options={['a', 'b', 'c']} onChange={action('onChange')} long large />);
