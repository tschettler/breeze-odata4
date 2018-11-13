import { Configuration } from 'webpack';
import * as nodeExternals from 'webpack-node-externals';

const config: Configuration = {
  devtool: 'inline-source-map',
  entry: './src/index.ts',
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
  resolve: {
    extensions: ['.ts', '.js']
  },
  target: 'node', // in order to ignore built-in modules like path, fs, etc.
};

export default config;
