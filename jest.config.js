module.exports = {
  transform: {
    '\\.ts$': ['babel-jest', { configFile: './babel.config.testing.js' }],
  },
};
