import React from 'react';
import {storiesOf} from '@storybook/react';

import backgroundsDecorator from './lib/backgroundsDecorator';

import ShuttleXpress from '../src/web/widgets/Axes/Settings/ShuttleXpress';

const mockProps = {
  feedrateMax: 1000,
  feedrateMin: 200,
  hertz: 10,
  overshoot: 5,
};

storiesOf('Widgets/Axes/Settings/ShuttleXpress', module)
  .addDecorator(backgroundsDecorator)
  .add('Default', () => <ShuttleXpress {...mockProps} />);
