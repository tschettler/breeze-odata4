import * as path from 'path';
import { Configuration } from 'webpack';
import webpackConfig from './webpack.config';

process.env.NODE_ENV = 'production';

const prodConfig: Configuration = {
  devtool: 'source-map',
  mode: 'production',
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, 'dist')
  }
};

export default Object.assign({}, webpackConfig, prodConfig);
