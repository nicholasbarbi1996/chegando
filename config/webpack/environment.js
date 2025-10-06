const { environment } = require('@rails/webpacker')
const path = require('path')

// Alias @ para app/javascript
environment.config.merge({
    resolve: {
        alias: {
            '@': path.resolve(__dirname, '..', '..', 'app/javascript')
        }
    }
})

module.exports = environment