import addonBackgrounds from '@storybook/addon-backgrounds';

const backgrounds = addonBackgrounds([
  {
    name: 'dark',
    value: 'rgb(90, 96, 99)',
    default: true,
  },
  {
    name: 'light',
    value: '#fff',
  },
]);

export default backgrounds;
