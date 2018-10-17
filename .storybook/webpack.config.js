// you can use this file to add your custom webpack plugins, loaders and anything you like.
// This is just the basic way to add additional webpack configurations.
// For more information refer the docs: https://storybook.js.org/configurations/custom-webpack-config

// IMPORTANT
// When you add this file, we won't add the default configurations which is similar
// to "React Create App". This only has babel loader to load JavaScript.

const path = require('path');
const webpack = require('webpack');

module.exports = (storybookBaseConfig, configType) => {
  const loadSCSS = {
    test: /\.scss$/,
    loaders: ['style-loader', 'css-loader', 'fast-sass-loader'],
    include: path.resolve(__dirname, '../'),
  };

  const loadCSS = {
    test: /\.css$/,
    use: ['style-loader', 'css-loader'],
  };

  const loadFonts = [
    {
      test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
      loader: 'url-loader',
      options: {
        limit: 10000,
        mimetype: 'application/font-woff',
      },
    },
    {
      test: /\.(ttf|eot)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
      loader: 'file-loader',
    },
  ];

  const loadImages = {
    test: /\.(png|jpg|svg)$/,
    loader: 'url-loader',
    options: {
      limit: 8192,
    },
  };

  storybookBaseConfig.module.rules.push(loadSCSS, loadImages, loadCSS, ...loadFonts);

  return storybookBaseConfig;
};
