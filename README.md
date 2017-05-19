# breeze-odata4 [![NPM version](https://badge.fury.io/js/breeze-odata4.svg)](https://npmjs.org/package/breeze-odata4) [![Build Status](https://travis-ci.org/tschettler/breeze-odata4.svg?branch=master)](https://travis-ci.org/tschettler/breeze-odata4)

> A TypeScript library to querying an OData 4 API using [breezejs](http://www.getbreezenow.com/breezejs)

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
import { config, EntityManager } from "breeze-client";
import { OData4DataService } from 'breeze-odata4';

OData4DataService.register();
config.initializeAdapterInstance('dataService', 'OData4', true);
var manager = new EntityManager('/api/odata4');
manager.fetchMetadata();

```
Now we can utilize breeze to query against an OData 4 API.

## License

MIT © [Travis Schettler](https://github.com/tschettler)
