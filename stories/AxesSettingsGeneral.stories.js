import React from 'react';
import {storiesOf} from '@storybook/react';

import backgroundsDecorator from './lib/backgroundsDecorator';

import General from '../src/web/widgets/Axes/Settings/General';

const mockProps = {
  axes: ['x', 'y', 'z'],
  imperialJogDistances: [0.125, 0.5, 1],
  metricJogDistances: [0.001, 0.01, 0.1, 1, 10],
};

storiesOf('Widgets/Axes/Settings/General', module)
  .addDecorator(backgroundsDecorator)
  .add('Default', () => <General {...mockProps} />);
