const fs = require('fs');

const baseDevConfig = (
  fs.existsSync('./webpack.dev.config')
    ? require('./webpack.dev.config')
    : require('@openedx/frontend-build/config/webpack.dev.config')
);

module.exports = {
  ...baseDevConfig,
  devServer: {
    ...(baseDevConfig.devServer || {}),
    // This configuration needs to be defined here, because CLI
    // arguments are ignored by the "npm run start" command
    allowedHosts: 'all',
    // We will have to make changes to this config in later releases of webpack dev server.
    // https://github.com/webpack/webpack-dev-server/blob/master/migration-v4.md
    proxy: {
      ...((baseDevConfig.devServer && baseDevConfig.devServer.proxy) || {}),
      '/api/mfe_config/v1': {
        target: 'http://local.openedx.io:8000',
        changeOrigin: true,
      },
    },
  },
};
