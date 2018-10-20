const autoprefixer = require('autoprefixer');
const browserslist = require('browserslist');
const cssnano = require('cssnano');
const CSSSplitWebpackPlugin = require('css-split-webpack-plugin').default;
const dotenv = require('dotenv');
const FriendlyErrorsWebpackPlugin = require('friendly-errors-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ManifestPlugin = require('webpack-manifest-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const path = require('path');
const StylelintPlugin = require('stylelint-webpack-plugin');
const webpack = require('webpack');
const without = require('lodash/without');
const WriteFileWebpackPlugin = require('write-file-webpack-plugin');

const buildConfig = require('./build.config');
const pkg = require('./package.json');

dotenv.config();

const publicPath = process.env.PUBLIC_PATH || '';
const buildVersion = pkg.version;
const timestamp = new Date().getTime();

module.exports = {
  mode: 'development',
  cache: true,
  target: 'web',
  context: path.resolve(__dirname, 'src/web'),
  devtool: 'cheap-module-eval-source-map',
  entry: {
    polyfill: [
      'eventsource-polyfill',
      'webpack-hot-middleware/client?reload=true',
      path.resolve(__dirname, 'src/web/polyfill/index.js'),
    ],
    app: [
      'eventsource-polyfill',
      'webpack-hot-middleware/client?reload=true',
      path.resolve(__dirname, 'src/web/index.js'),
    ],
  },
  output: {
    path: path.resolve(__dirname, 'output/web'),
    chunkFilename: `[name].[hash].bundle.js?_=${timestamp}`,
    filename: `[name].[hash].bundle.js?_=${timestamp}`,
    pathinfo: true,
    publicPath: publicPath,
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)?$/,
        loader: 'eslint-loader',
        enforce: 'pre',
        exclude: /node_modules/,
        options: {
          quiet: true,
        },
      },
      {
        test: /\.jsx?$/,
        loader: 'babel-loader',
        exclude: /(node_modules)/,
      },
      // {
      //   test: /\.scss$/,
      //   use: [
      //     require.resolve('style-loader'),
      //     {
      //       loader: 'css-loader',
      //       options: {
      //         camelCase: true,
      //       },
      //     },
      //     {
      //       loader: 'postcss-loader',
      //       options: {
      //         plugins: [
      //           autoprefixer({
      //             browsers: browserslist(),
      //             flexbox: 'no-2009',
      //           }),
      //           cssnano({
      //             discardComments: {
      //               removeAll: true,
      //             },
      //             options: {
      //               safe: true,
      //               sourcemap: false,
      //             },
      //             svgo: false, // trying to run svgo breaks for unknown reasons and we don't need it anyway, so just switch it off
      //           }),
      //         ],
      //       },
      //     },
      //     {
      //       loader: 'fast-sass-loader',
      //       options: {
      //         errLogToConsole: true,
      //         includePaths: [path.resolve(__dirname, 'src/web/scss'), path.resolve(__dirname, 'node_modules')],
      //       },
      //     },
      //   ],
      // },
      {
        test: /\.scss$/,
        use: [
          MiniCssExtractPlugin.loader,
          // require.resolve('style-loader'),
          {
            loader: 'css-loader',
            options: {
              camelCase: true,
              importLoaders: 1,
              localIdentName: '[path][name]__[local]--[hash:base64:5]',
              // modules: true, // generate locally scoped css modules
            },
          },
          {
            loader: 'postcss-loader',
            options: {
              plugins: [
                autoprefixer({
                  browsers: browserslist(),
                  flexbox: 'no-2009',
                }),
                cssnano({
                  discardComments: {
                    removeAll: true,
                  },
                  options: {
                    safe: true,
                    sourcemap: false,
                  },
                  svgo: false, // trying to run svgo breaks for unknown reasons and we don't need it anyway, so just switch it off
                }),
              ],
            },
          },
          {
            loader: 'fast-sass-loader',
            options: {
              errLogToConsole: true,
              exclude: [path.resolve(__dirname, 'src/web/scss')],
            },
          },
        ],
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.(png|jpg|svg)$/,
        loader: 'url-loader',
        options: {
          limit: 8192,
        },
      },
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
    ],
  },
  node: {
    fs: 'empty',
    net: 'empty',
    tls: 'empty',
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.DefinePlugin({
      'process.env': {
        BUILD_VERSION: JSON.stringify(buildVersion),
        LANGUAGES: JSON.stringify(buildConfig.languages),
        NODE_ENV: JSON.stringify('development'),
        TRACKING_ID: JSON.stringify(buildConfig.analytics.trackingId),
      },
    }),
    // https://github.com/gajus/write-file-webpack-plugin
    // Forces webpack-dev-server to write bundle files to the file system.
    new WriteFileWebpackPlugin(),
    new webpack.ContextReplacementPlugin(
      /moment[\/\\]locale$/,
      new RegExp('^./(' + without(buildConfig.languages, 'en').join('|') + ')$')
    ),
    // Generates a manifest.json file in your root output directory with a mapping of all source file names to their corresponding output file.
    new ManifestPlugin({
      fileName: 'manifest.json',
    }),
    new MiniCssExtractPlugin({
      filename: `[name].css?_=${timestamp}`,
      chunkFilename: `[id].css?_=${timestamp}`,
    }),
    new CSSSplitWebpackPlugin({
      size: 4000,
      imports: '[name].[ext]?[hash]',
      filename: '[name]-[part].[ext]?[hash]',
      preserve: false,
    }),
    new StylelintPlugin({
      files: ['src/web/**/*.scss'],
    }),
    new HtmlWebpackPlugin({
      filename: 'index.hbs',
      template: path.resolve(__dirname, 'src/web/assets/index.hbs'),
      chunksSortMode: 'dependency', // Sort chunks by dependency
    }),
    new FriendlyErrorsWebpackPlugin(),
  ],
  resolve: {
    modules: [path.resolve(__dirname, 'src'), 'node_modules'],
    extensions: ['.js', '.jsx', '.scss'],
  },
};
