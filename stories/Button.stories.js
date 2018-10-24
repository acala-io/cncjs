import React, {Fragment} from 'react';
import {action} from '@storybook/addon-actions';
import {storiesOf} from '@storybook/react';

import backgroundsDecorator from './lib/backgroundsDecorator';

import Button from '../src/web/components_new/Button';

storiesOf('Components/Button', module)
  .addDecorator(backgroundsDecorator)
  .add('Default', () => (
    <Fragment>
      <Button text="Save" onClick={action('onClick')} /> <Button text="Save" onClick={action('onClick')} isDisabled />
    </Fragment>
  ))
  .add('Icon', () => (
    <Fragment>
      <Button text="Save" icon="cancel" onClick={action('onClick')} />{' '}
      <Button text="Save" icon="cancel" onClick={action('onClick')} isDisabled />
    </Fragment>
  ))
  .add('Danger', () => (
    <Fragment>
      <Button text="Save" onClick={action('onClick')} danger />{' '}
      <Button text="Save" onClick={action('onClick')} danger isDisabled />
      <Button text="Save" icon="cancel" onClick={action('onClick')} danger />{' '}
      <Button text="Save" icon="cancel" onClick={action('onClick')} danger isDisabled />
    </Fragment>
  ))
  .add('Large', () => (
    <Fragment>
      <Button text="Save" onClick={action('onClick')} size="large" />{' '}
      <Button text="Save" onClick={action('onClick')} size="large" isDisabled />
    </Fragment>
  ))
  .add('Huge', () => (
    <Fragment>
      <Button text="Save" onClick={action('onClick')} size="huge" />{' '}
      <Button text="Save" onClick={action('onClick')} size="huge" isDisabled />
    </Fragment>
  ))
  .add('InProgress', () => <Button text="Save" onClick={action('onClick')} isInProgress />);
