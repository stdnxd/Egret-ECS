var path = require('path');
var webpack = require('webpack');

module.exports = {
  entry: [
    './editor/src/index.js'
  ],
  output: {
    path: path.join(__dirname, './built'),
    filename: 'bundle.js'
  },
  module: {
    loaders: [
    { test:/\.scene$/, loader: 'json-loader' },
    { test: /\.css$/, loader: 'style-loader!css-loader' },
    {
      test: /\.js$/,
      loaders: ['react-hot', 'babel'],
      include: path.join(__dirname, './src')
    }]
  }
};