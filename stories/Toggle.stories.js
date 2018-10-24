import React, {Fragment} from 'react';
import {action} from '@storybook/addon-actions';
import {storiesOf} from '@storybook/react';

import backgroundsDecorator from './lib/backgroundsDecorator';

import Toggle from '../src/web/components_new/Toggle';

const isTrue = true;

storiesOf('Components/Toggle', module)
  .addDecorator(backgroundsDecorator)
  .add('On', () => <Toggle value={isTrue} onClick={action('onClick')} />)
  .add('Off', () => <Toggle value={!isTrue} onClick={action('onClick')} />)
  .add('Disabled', () => <Toggle value={isTrue} onClick={action('onClick')} disabled />)
  .add('Custom Text', () => (
    <Fragment>
      <Toggle value={isTrue} textOff="Aus" textOn="An" onClick={action('onClick')} />
      <Toggle value={!isTrue} textOff="Aus" textOn="An" onClick={action('onClick')} />
    </Fragment>
  ));
