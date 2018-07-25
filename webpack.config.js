const webpack = require('webpack');
const path = require('path');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const fs = require('fs');

const src = path.resolve(__dirname, 'src');
const resources = path.resolve(__dirname, 'resources');
const devServerKey = fs.readFileSync('./resources/ssl/dev-server-key.pem');
const devServerCert = fs.readFileSync('./resources/ssl/dev-server-cert.pem');

module.exports = function(env, argv) {
  const isProduction = argv.mode === 'production';
  const isWebpackDevServerStarted = process.argv[1].indexOf('webpack-dev-server') > -1;
  const dist = path.resolve(__dirname, 'dist-' + env.tool);

  return {
    entry: isWebpackDevServerStarted
      ? {
        'event-bus': ['./src/index', './resources/event-bus-test']
      }
      : {
        'event-bus': './src/index'
      },
    output: {
      filename: '[name].js',
      path: dist,
      publicPath: '/'
    },
    mode: argv.mode || 'production',
    devtool: isProduction ? false : 'eval-source-map',
    plugins: [
      isWebpackDevServerStarted ? null : new CleanWebpackPlugin([dist]),
      isWebpackDevServerStarted ? new webpack.HotModuleReplacementPlugin() : null,
      new webpack.DefinePlugin({
        // 'process.env.NODE_ENV': JSON.stringify(argv.mode), will be set by Webpack mode option
        'process.env.NODE_TOOL': JSON.stringify(env.tool),
        'process.env.NODE_IS_WEBPACK_DEV_SERVER_STARTED': JSON.stringify(isWebpackDevServerStarted),
        'process.env.NODE_IS_REMOTE_TOOL': !!env.remoteTool,
      }),
      isWebpackDevServerStarted ? new HtmlWebpackPlugin() : null,
    ].filter(Boolean),
    module: {
      rules: [
        {
          test: /\.js$/,
          include: [src],
          use: 'babel-loader'
        }
      ]
    },

    devServer: {
      contentBase: dist,
      port: 9093,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        // 'Access-Control-Allow-Headers': 'Content-Type'
      },
      https: {
        key: devServerKey,
        cert: devServerCert,
        ca: devServerCert
      }
    }
  }
};
