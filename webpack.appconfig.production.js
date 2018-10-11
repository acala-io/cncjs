const crypto = require('crypto');
const path = require('path');
const boolean = require('boolean');
const dotenv = require('dotenv');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const webpack = require('webpack');
const nodeExternals = require('webpack-node-externals');
const pkg = require('./package.json');

dotenv.config({
    path: path.resolve('webpack.appconfig.production.env')
});

const USE_ESLINT_LOADER = boolean(process.env.USE_ESLINT_LOADER);
const USE_UGLIFYJS_PLUGIN = boolean(process.env.USE_UGLIFYJS_PLUGIN);

// Use publicPath for production
const payload = pkg.version;
const publicPath = (payload => {
    const algorithm = 'sha1';
    const buf = String(payload);
    const hash = crypto.createHash(algorithm).update(buf).digest('hex');

    return '/' + hash.substr(0, 8) + '/'; // 8 digits
})(payload);
const buildVersion = pkg.version;

module.exports = {
    mode: 'production',
    devtool: 'cheap-module-source-map',
    target: 'node', // ignore built-in modules like path, fs, etc.
    context: path.resolve(__dirname, 'src/app'),
    entry: {
        index: [
            './index.js'
        ]
    },
    output: {
        path: path.resolve(__dirname, 'dist/cnc/app'),
        filename: '[name].js',
        libraryTarget: 'commonjs2'
    },
    optimization: {
        minimizer: [
            USE_UGLIFYJS_PLUGIN && (
                new UglifyJsPlugin({
                    cache: true,
                    parallel: true,
                    sourceMap: true
                })
            )
        ].filter(Boolean)
    },
    plugins: [
        new webpack.DefinePlugin({
            'global.NODE_ENV': JSON.stringify('production'),
            'global.PUBLIC_PATH': JSON.stringify(publicPath),
            'global.BUILD_VERSION': JSON.stringify(buildVersion)
        })
    ],
    module: {
        rules: [
            USE_ESLINT_LOADER && {
                test: /\.jsx?$/,
                loader: 'eslint-loader',
                enforce: 'pre',
                exclude: /node_modules/
            },
            {
                test: /\.jsx?$/,
                loader: 'babel-loader',
                exclude: /node_modules/
            }
        ].filter(Boolean)
    },
    externals: [nodeExternals()], // ignore all modules in node_modules folder
    resolve: {
        extensions: ['.js', '.jsx']
    },
    resolveLoader: {
        modules: [
            path.resolve(__dirname, 'node_modules')
        ]
    },
    node: {
        console: true,
        global: true,
        process: true,
        Buffer: true,
        __filename: true, // Use relative path
        __dirname: true, // Use relative path
        setImmediate: true
    }
};
