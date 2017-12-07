'use strict';

const merge = require('webpack-merge');
const common = require('./webpack.common.js');
const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require("html-webpack-plugin");
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const WebpackCleanupPlugin = require('webpack-cleanup-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const I18nPlugin = require('./i18n.plugin');

module.exports = merge(common, {
  devtool: "eval-source-map",

  entry: {
    dark: './public/sass/grafana.dark.scss',
    light: './public/sass/grafana.light.scss',
    vendor: require('./dependencies'),
  },

  module: {
    rules: [
      require('./sass.rule.js')({
        sourceMap: true, minimize: false
      })
    ]
  },

  plugins: [
    new I18nPlugin({
      filename: path.resolve(__dirname, '../../public/app/i18n/langs.ts'),
      template: path.resolve(__dirname, '../../public/app/i18n/langs.tmpl'),
      i18npath: path.resolve(__dirname, '../../i18n')
    }),
    new ExtractTextPlugin({ // define where to save the file
      filename: 'grafana.[name].css',
    }),
    new HtmlWebpackPlugin({
      filename: path.resolve(__dirname, '../../public/views/index.html'),
      template: path.resolve(__dirname, '../../public/views/index.template.html'),
      inject: 'body',
      chunks: ['manifest', 'vendor', 'app'],
    }),
    new webpack.DefinePlugin({
      'process.env': {
        'NODE_ENV': JSON.stringify('development')
      }
    }),
    new webpack.optimize.CommonsChunkPlugin({
      names: ['vendor', 'manifest'],
    }),
    // new BundleAnalyzerPlugin({
    //   analyzerPort: 8889
    // })
  ]
});
