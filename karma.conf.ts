// karma.conf.ts
import * as karma from "karma";
import * as webpack from "webpack";
import webpackConfig from "./webpack.config";

interface KarmaWebpackConfig extends karma.ConfigOptions {
  webpack: webpack.Configuration;
}

const isProd = process.env.NODE_ENV === "production";

const karmaConfig: KarmaWebpackConfig = {
  basePath: "",
  files: ["tests/*.spec.ts"],
  frameworks: ["jasmine"],
  exclude: [],
  reporters: ["spec"],
  colors: true,
  logLevel: karma.constants.LOG_INFO,
  autoWatch: true,
  browsers: ["PhantomJS"],
  singleRun: isProd,
  concurrency: Infinity,
  preprocessors: {
    "**/*.ts": ["webpack", "sourcemap"]
  },
  webpack: {
    mode: isProd ? "production" : "development",
    module: webpackConfig.module,
    resolve: webpackConfig.resolve
  }
};

// Karma required export function
export default function(config) {
  config.set(karmaConfig);
}
