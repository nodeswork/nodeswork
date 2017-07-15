# Nodeswork

Nodeswork is a framework to build simple applications and to deploy easily to
nodeswork.com.

## Installation

```sh
$ npm install nodeswork
```

## Quick Start

```javascript
let nodeswork = require('nodeswork');

let devConfig = require('./dev-config.json');

nodeswork
  .config(devConfig)
  .process(async function(ctx) => {
  })
  .start();
```

## Configuration

Options     | Required | Details
:-----------|:---------|:----------------------
appletId    | required |
appletToken | required |
name        | required |
server      | required |
host        |          | **Default**: localhost
port        |          | **Default**: 28888

### Example
```javascript
nodeswork
  .config({
    name: 'My Applet',
    server: 'localhost:3000',
    host: 'localhost',
    port: 28888,
    appletId: 'copy my applet id here',
    appletToken: 'copy my applet token here',
  });
```
