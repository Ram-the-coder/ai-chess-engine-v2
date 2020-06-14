module.exports = function override(config, env) {
    config.module.rules.push({
        test: /\.worker\.js$/,
        use: { loader: 'worker-loader' }
    });

    config.optimization.noEmitOnErrors = false;
    return config;
};