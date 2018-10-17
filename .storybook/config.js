import {addDecorator, configure} from '@storybook/react';
import {initScreenshot} from 'storybook-chrome-screenshot';

addDecorator(initScreenshot());

import '../src/web/scss/app.scss';

// automatically import all files ending in *.stories.js
const req = require.context('../stories', true, /.stories.js$/);
function loadStories() {
  req.keys().forEach(filename => req(filename));
}

configure(loadStories, module);
