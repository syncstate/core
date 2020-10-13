const strip = require('@rollup/plugin-strip');

module.exports = {
  rollup(config, options) {
    config.plugins.push(
      strip({
        include: ['**/*.js', '**/*.ts'],
        functions: options.env === 'production' ? ['console.log'] : [],
        debugger: options.env === 'production' ? true : false,
      })
    );
    return config;
  },
};
