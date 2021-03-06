/* eslint-disable import/default */

import webpack from 'webpack';
import webpackDevMiddleware from 'webpack-dev-middleware';
import webpackHotMiddleware from 'webpack-hot-middleware';

import config from '../../webpack.webconfig.development';
import log from './lib/logger';

const webpackDevServer = app => {
  if (process.env.NODE_ENV !== 'development') {
    log.error('The process.env.NODE_ENV should be "development" while running a webpack server');
    return;
  }

  const compiler = webpack(config);

  // https://github.com/webpack/webpack-dev-middleware
  // webpack-dev-middleware handle the files in memory.
  app.use(
    webpackDevMiddleware(compiler, {
      lazy: false,
      publicPath: config.output.publicPath,
      stats: {
        colors: true,
      },
      // https://webpack.github.io/docs/node.js-api.html#compiler
      watchOptions: {
        ignored: /node_modules/,
        poll: true, // use polling instead of native watchers
      },
    })
  );

  app.use(webpackHotMiddleware(compiler));
};

export default webpackDevServer;
