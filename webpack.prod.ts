import * as path from 'path';
import * as webpack from 'webpack';
import webpackConfig from './webpack.config';

process.env.NODE_ENV = 'production';

const prodConfig: webpack.Configuration = {
  devtool: 'source-map',
  mode: 'production',
  output: {
    filename: '[name].bundle.js',
    library: 'breeze-odata4',
    libraryTarget: 'umd',
    path: path.resolve(__dirname, 'dist'),
    umdNamedDefine: true
  }
};

export default Object.assign({}, webpackConfig, prodConfig);
