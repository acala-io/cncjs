// import React from 'react';
// import {action} from '@storybook/addon-actions';
// import {storiesOf} from '@storybook/react';

// import backgroundsDecorator from './lib/backgroundsDecorator';

// import Settings from '../src/web/widgets/Axes/Settings';

// const mockProps = {
//   config: {
//     axes: ['x', 'y', 'z'],
//     jog: {
//       imperial: {
//         distances: [0.125, 0.5, 1],
//       },
//       metric: {
//         distances: [0.001, 0.01, 0.1, 1, 10],
//       },
//     },
//     shuttle: {
//       feedrateMin: 100,
//       feedrateMax: 1000,
//       hertz: 200,
//       overshoot: 3,
//     },
//   },
//   onCancel: action('onCancel'),
//   onSave: action('onSave'),
// };

// storiesOf('Widgets/Axes/Settings', module)
//   .addDecorator(backgroundsDecorator)
//   .add('All settings', () => <Settings {...mockProps} />);
