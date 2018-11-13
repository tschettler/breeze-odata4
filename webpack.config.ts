import { Configuration } from 'webpack';
import * as nodeExternals from 'webpack-node-externals';

const config: Configuration = {
  devtool: 'inline-source-map',
  entry: {
    'breeze-odata4': './src/index.ts',
  },
  externals: [nodeExternals()], // in order to ignore all modules in node_modules folder
  mode: 'development',
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/
      }
    ]
  },
  optimization: {
    minimize: process.env.NODE_ENV === 'production'
  },
  resolve: {
    extensions: ['.ts', '.js']
  },
  target: 'web' // in order to ignore built-in modules like path, fs, etc.
};

export default config;
