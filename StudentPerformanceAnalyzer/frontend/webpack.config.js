const path = require('path');

module.exports = {
  entry: './script.js',

  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
  },

  devServer: {
    static: {
      directory: path.join(__dirname),
    },
    port: 3000,
    open: true,
  },
};
