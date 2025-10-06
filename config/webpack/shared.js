const { resolve } = require('path');

module.exports = {
    resolve: {
        alias: {
            '@': resolve(__dirname, '../../app/javascript'),
        },
        extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
    },
};