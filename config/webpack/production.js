const generateWebpackConfigs = require('./generateWebpackConfigs');
const { resolve } = require('path');

const productionEnvOnly = (clientWebpackConfig, serverWebpackConfig) => {
    // Exemplo: adicionar alias @ → app/javascript
    [clientWebpackConfig, serverWebpackConfig].forEach(config => {
        if (config && config.resolve) {
            config.resolve.alias = {
                ...(config.resolve.alias || {}),
                '@': resolve(__dirname, '../../app/javascript')
            };
            config.resolve.extensions = [...(config.resolve.extensions || []), '.ts', '.tsx', '.js', '.jsx'];
        }
    });
};

module.exports = generateWebpackConfigs(productionEnvOnly);