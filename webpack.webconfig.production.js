const autoprefixer = require('autoprefixer');
const boolean = require('boolean');
const browserslist = require('browserslist');
const crypto = require('crypto');
const cssnano = require('cssnano');
const CSSSplitWebpackPlugin = require('css-split-webpack-plugin').default;
const dotenv = require('dotenv');
const findImports = require('find-imports');
const FriendlyErrorsWebpackPlugin = require('friendly-errors-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ManifestPlugin = require('webpack-manifest-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const path = require('path');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const webpack = require('webpack');
const without = require('lodash/without');

const buildConfig = require('./build.config');
const pkg = require('./package.json');

dotenv.config({
  path: path.resolve('webpack.webconfig.production.env'),
});

const USE_ESLINT_LOADER = boolean(process.env.USE_ESLINT_LOADER);
const USE_UGLIFYJS_PLUGIN = boolean(process.env.USE_UGLIFYJS_PLUGIN);
const USE_OPTIMIZE_CSS_ASSETS_PLUGIN = boolean(process.env.USE_OPTIMIZE_CSS_ASSETS_PLUGIN);

// Use publicPath for production
const publicPath = (payload => {
  const algorithm = 'sha1';
  const buf = String(payload);
  const hash = crypto
    .createHash(algorithm)
    .update(buf)
    .digest('hex');

  return '/' + hash.substr(0, 8) + '/'; // 8 digits
})(pkg.version);
const buildVersion = pkg.version;
const timestamp = new Date().getTime();

module.exports = {
  mode: 'production',
  cache: true,
  target: 'web',
  context: path.resolve(__dirname, 'src/web'),
  devtool: 'cheap-module-source-map',
  entry: {
    polyfill: [path.resolve(__dirname, 'src/web/polyfill/index.js')],
    vendor: findImports(['src/web/**/*.{js,jsx}', '!src/web/polyfill/**/*.js', '!src/web/**/*.development.js'], {
      flatten: true,
    }),
    app: [path.resolve(__dirname, 'src/web/index.js')],
  },
  output: {
    path: path.resolve(__dirname, 'dist/cnc/web'),
    chunkFilename: `[name].[chunkhash].bundle.js?_=${timestamp}`,
    filename: `[name].[chunkhash].bundle.js?_=${timestamp}`,
    publicPath: publicPath,
  },
  module: {
    rules: [
      USE_ESLINT_LOADER && {
        test: /\.jsx?$/,
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
          require.resolve('style-loader'),
          {
            loader: 'css-loader',
            options: {
              camelCase: true,
              importLoaders: 1,
              localIdentName: '[path][name]__[local]--[hash:base64:5]',
              modules: true,
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
    ].filter(Boolean),
  },
  node: {
    fs: 'empty',
    net: 'empty',
    tls: 'empty',
  },
  optimization: {
    minimizer: [
      USE_UGLIFYJS_PLUGIN &&
        new UglifyJsPlugin({
          cache: true,
          parallel: true,
          sourceMap: true,
        }),
      USE_OPTIMIZE_CSS_ASSETS_PLUGIN && new OptimizeCSSAssetsPlugin(),
    ].filter(Boolean),
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        BUILD_VERSION: JSON.stringify(buildVersion),
        LANGUAGES: JSON.stringify(buildConfig.languages),
        NODE_ENV: JSON.stringify('production'),
        TRACKING_ID: JSON.stringify(buildConfig.analytics.trackingId),
      },
    }),
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
    new HtmlWebpackPlugin({
      filename: 'index.hbs',
      template: path.resolve(__dirname, 'src/web/assets/index.hbs'),
      chunksSortMode: 'dependency', // Sort chunks by dependency
    }),
    new FriendlyErrorsWebpackPlugin(),
  ],
  resolve: {
    modules: [path.resolve(__dirname, 'src'), 'node_modules'],
    extensions: ['.js', '.jsx'],
  },
};
