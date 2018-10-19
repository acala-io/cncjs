import React from 'react';
// import {action} from '@storybook/addon-actions';
import {storiesOf} from '@storybook/react';
import {withKnobs, select} from '@storybook/addon-knobs/react';

import backgroundsDecorator from './lib/backgroundsDecorator';

import SpindleAnimation from '../src/web/widgets/Spindle/SpindleAnimation';

storiesOf('Components/SpindleAnimation', module)
  .addDecorator(withKnobs)
  .addDecorator(backgroundsDecorator)
  .add('Default', () => <SpindleAnimation height="400" coolant="off" spindle="off" />)
  .add('Spindle Right', () => <SpindleAnimation height="400" coolant="off" spindle="right" />)
  .add('Spindle Left', () => <SpindleAnimation height="400" coolant="off" spindle="left" />)
  .add('Coolant Mist', () => <SpindleAnimation height="400" coolant="mist" spindle="off" />)
  .add('Coolant Flood', () => <SpindleAnimation height="400" coolant="flood" spindle="off" />)
  .add('Spindle Right Coolant Mist', () => <SpindleAnimation height="400" coolant="mist" spindle="right" />)
  .add('Spindle Right Coolant Flood', () => <SpindleAnimation height="400" coolant="flood" spindle="right" />)
  .add('With Knobs', () => {
    const coolant = select(
      'Coolant',
      {
        off: 'off',
        mist: 'mist',
        flood: 'flood',
      },
      'off'
    );
    const spindle = select(
      'Spindle',
      {
        off: 'off',
        right: 'right',
        left: 'left',
      },
      'off'
    );

    return <SpindleAnimation height="400" coolant={coolant} spindle={spindle} />;
  });
