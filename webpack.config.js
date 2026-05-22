const path = require('path');
module.exports = {
  mode: 'production',
  entry: './src/index.jsx',
  output: { path: path.resolve(__dirname, 'dist'), filename: 'bundle.js', clean: true },
  resolve: { extensions: ['.js', '.jsx'] },
  module: {
    rules: [
      { test: /\.(js|jsx)$/, exclude: /node_modules/, use: { loader: 'babel-loader', options: { presets: ['@babel/preset-env', '@babel/preset-react'] } } },
      { test: /\.css$/, use: ['style-loader', 'css-loader'] },
    ],
  },
  performance: { hints: false },
};
