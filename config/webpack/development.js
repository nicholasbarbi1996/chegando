// config/webpack/development.js
const { resolve } = require('path');
const generateWebpackConfigs = require('./generateWebpackConfigs');

const sharedResolveConfig = {
  alias: {
    '@': resolve(__dirname, '../../app/javascript'),
    '@shared': resolve(__dirname, '../../app/javascript/shared')
  },
  extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
};

const developmentEnvOnly = (clientWebpackConfig, serverWebpackConfig) => {
  // aplica alias no client e no server
  [clientWebpackConfig, serverWebpackConfig].forEach(config => {
    if (config && config.resolve) {
      config.resolve.alias = {
        ...(config.resolve.alias || {}),
        ...sharedResolveConfig.alias,
      };
      config.resolve.extensions = [
        ...(config.resolve.extensions || []),
        ...sharedResolveConfig.extensions,
      ];
    }
  });

  if (process.env.WEBPACK_SERVE) {
    const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');
    clientWebpackConfig.plugins.push(new ReactRefreshWebpackPlugin());

    if (!clientWebpackConfig.devServer) {
      clientWebpackConfig.devServer = {};
    }

    clientWebpackConfig.devServer = {
      host: '0.0.0.0',
      port: 3036,
      hot: true,
      liveReload: true,
      headers: {
        'Access-Control-Allow-Origin': 'http://localhost:3001',
        'Access-Control-Allow-Credentials': 'true',
      },
      allowedHosts: 'all',
    };
  }
};

module.exports = generateWebpackConfigs(developmentEnvOnly);