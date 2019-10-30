import builtins from 'rollup-plugin-node-builtins';
import camelCase from 'camelcase';
import commonjs from 'rollup-plugin-commonjs';
import json from 'rollup-plugin-json';
import resolve from 'rollup-plugin-node-resolve';
import sourceMaps from 'rollup-plugin-sourcemaps';
import typescript from 'rollup-plugin-typescript2';

const pkg = require('./package.json');

export default {
  input: 'src/index.ts',
  output: [
    {
      file: pkg.main,
      name: camelCase(pkg.name),
      format: 'umd',
      globals: {
        'breeze-client': 'breeze',
        'ts-odatajs': 'odatajs',
      },
      sourcemap: true
    },
    { file: pkg.module, format: 'es', sourcemap: true }
  ],
  // Indicate here external modules you don't wanna include in your bundle (i.e.: 'lodash')
  external: Object.keys(pkg.dependencies),
  watch: {
    include: 'src/**'
  },
  plugins: [
    // Allow shim for node modules
    builtins(),
    // Allow json resolution
    json(),
    // Compile TypeScript files
    typescript({ useTsconfigDeclarationDir: true }),
    // Allow bundling cjs modules (unlike webpack, rollup doesn't understand cjs)
    commonjs(),
    // Allow node_modules resolution, so you can use 'external' to control
    // which external modules to include in the bundle
    // https://github.com/rollup/rollup-plugin-node-resolve#usage
    resolve({preferBuiltins: true}),

    // Resolve source maps to the original source
    sourceMaps()
  ]
};
