# spool-express
:package: Express Spool

[![Gitter][gitter-image]][gitter-url]
[![NPM version][npm-image]][npm-url]
[![Build Status][ci-image]][ci-url]
[![Test Coverage][coverage-image]][coverage-url]
[![Dependency Status][daviddm-image]][daviddm-url]
[![Follow @FabrixApp on Twitter][twitter-image]][twitter-url]

This pack binds the routes compiled in [spool-router](https://github.com/fabrix-app/spool-router)
to an [Express Server](http://expressjs.com/en/api.html). 

## Install

```sh
$ npm install @fabrix/spool-express --save
```

## Compatibility

This spool is compatible with Express [v4](http://expressjs.com/en/4x/api.html) and [v5](https://github.com/expressjs/express/tree/5.0).

#### Express v4

```
$ npm install --save express@^4
```

#### Express v5

```
$ npm install --save express@^5.0.0-alpha.2
```

## Usage
Load in your spool config.

```js
// config/main.js
module.exports = {
  // ...
  spools: [
    require('@fabrix/spool-router').RouterSpool,
    require('@fabrix/spool-express').ExpressSpool
  ]
}
```

## Static assets
```js
// config/main.js
module.exports = {
  // ...
  paths: {
    ...
    www: path.resolve(__dirname, '..', 'public')
    ...
  }
}
```

## View Config
Choose a template engine.

```js
// config/views.js
module.exports = {
  engine: 'pug'
}
```

Then simply write your views in a directory called 'views'!

## Configuration

See [`config/web.js`](https://github.com/fabrix-app/spool-express/blob/master/archetype/config/web.js) for a full example.

#### `express`
Require field to set express version to use by setting `express: require('express')`

#### `cors`
Optional field to configure CORS, can be a boolean or an object (see https://github.com/expressjs/cors#configuring-cors)

#### `port`
The port to listen on. `3000` by default. Can also be set via the `PORT` environment variable.

#### `host`
The hostname of the server.

#### `cache`
The number of seconds to cache flat files on disk being served by Express

#### `externalConfig`
external configuration for your express app (can be used for configuring letsencrypt)

#### `ssl`
SSL options (`key`, `cert` or `pfx`) to allow set https protocol

#### `redirectToHttps`
Automatically redirect HTTP request to HTTPS if ssl enabled

#### `portHttp`
The port to listen for http protocol if ssl enabled. If you don't want http and https, don't add this field.

#### `middlewares`
Object to add custom middleware functions to Express, don't forget to add them into `middlewares.order` or they will not be called

### `init`
Method to customize express instance

## Contributing
We love contributions! Please check out our [Contributor's Guide](https://github.com/fabrix-app/fabrix/blob/master/.github/CONTRIBUTING.md) for more
information on how our projects are organized and how to get started.

## License
[MIT](https://github.com/fabrix-app/spool-express/blob/master/LICENSE)

[fabrix-image]: http://i.imgur.com/zfT2NEv.png
[fabrix-url]: http://fabrix.app
[npm-image]: https://img.shields.io/npm/v/@fabrix/spool-express.svg?style=flat-square
[npm-url]: https://npmjs.org/package/@fabrix/spool-express
[ci-image]: https://img.shields.io/circleci/project/github/fabrix-app/spool-express/master.svg
[ci-url]: https://circleci.com/gh/fabrix-app/spool-express/tree/master
[daviddm-image]: http://img.shields.io/david/fabrix-app/spool-express.svg?style=flat-square
[daviddm-url]: https://david-dm.org/fabrix-app/spool-express
[gitter-image]: http://img.shields.io/badge/+%20GITTER-JOIN%20CHAT%20%E2%86%92-1DCE73.svg?style=flat-square
[gitter-url]: https://gitter.im/fabrix-app/Lobby
[twitter-image]: https://img.shields.io/twitter/follow/FabrixApp.svg?style=social
[twitter-url]: https://twitter.com/FabrixApp
[coverage-image]: https://img.shields.io/codeclimate/coverage/github/fabrix-app/spool-express.svg?style=flat-square
[coverage-url]: https://codeclimate.com/github/fabrix-app/spool-express/coverage

