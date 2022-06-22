'use strict';

const { merge } = require('webpack-merge');
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin');
const webpack = require('webpack');

const common = require('./webpack.common.js');
const PATHS = require('./paths');

// Merge webpack configuration files
const config = (env, argv) =>
  merge(common, {
    entry: {
      contentScript: PATHS.src + '/contentScript.js',
    },
    devtool: argv.mode === 'production' ? false : 'source-map',
    plugins: [
      new NodePolyfillPlugin(),
      new webpack.ProvidePlugin({
        $: 'jquery',
        jQuery: 'jquery',
      }),
    ],
    node: undefined,
    resolve: {
      alias: {
        stream: require.resolve('stream-browserify'),
        zlib: require.resolve('browserify-zlib'),
      },
    },
  });

module.exports = config;
