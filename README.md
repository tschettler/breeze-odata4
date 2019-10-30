# breeze-odata4 [![NPM version](https://badge.fury.io/js/breeze-odata4.svg)](https://npmjs.org/package/breeze-odata4) [![Build Status](https://travis-ci.org/tschettler/breeze-odata4.svg?branch=master)](https://travis-ci.org/tschettler/breeze-odata4) [![Coverage Status](https://coveralls.io/repos/github/tschettler/breeze-odata4/badge.svg?branch=master)](https://coveralls.io/github/tschettler/breeze-odata4?branch=master)

> A TypeScript library to enable querying an OData 4 API using [breezejs](http://www.getbreezenow.com/breezejs)

## Prerequisites

* Breeze client npm package

## Installation

1. Install breeze-client

   ```sh
   $ npm install --save breeze-client
   ```
2. Install breeze-odata4
   ```sh
   $ npm install --save breeze-odata4
   ```

## Usage

```js
import { EntityManager } from 'breeze-client';
import { BreezeOData4 } from 'breeze-odata4';

BreezeOData4.configure();

const manager = new EntityManager('/api/odata4');
manager.fetchMetadata();

```
Now we can utilize breeze to query against an OData 4 API.

## Samples

Samples can be found in the samples repo: https://github.com/tschettler/breeze-odata4-samples

## Typings

This library is currently referencing its own version of breeze-client typings, since the current typings available on DefinitelyTyped and within the breeze-client npm package are incomplete/outdated.

## License

MIT © [Travis Schettler](https://github.com/tschettler)
