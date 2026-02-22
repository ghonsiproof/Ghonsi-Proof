// craco.config.js
const path = require('path');

module.exports = {
    webpack: {
        configure: (webpackConfig) => {
            // === Your existing polyfills (keep these) ===
            webpackConfig.resolve.fallback = {
                ...webpackConfig.resolve.fallback,
                crypto: require.resolve('crypto-browserify'),
                stream: require.resolve('stream-browserify'),
                vm: false,
            };

            // === Suppress noisy source-map-loader warnings from node_modules ===
            webpackConfig.ignoreWarnings = [
                ...(webpackConfig.ignoreWarnings || []),
                // Ignore all "Failed to parse source map" from node_modules (targets @trezor, @reown, @walletconnect, superstruct, etc.)
                (warning) => {
                    return (
                        warning.module &&
                        warning.module.resource &&
                        warning.module.resource.includes('node_modules') &&
                        warning.details &&
                        warning.details.includes('Failed to parse source map')
                    );
                },
            ];

            return webpackConfig;
        },
    },
};