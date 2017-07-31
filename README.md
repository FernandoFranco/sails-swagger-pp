# sails-swagger

[![NPM version][npm-image]][npm-url]
[![Build status][ci-image]][ci-url]
[![Dependency Status][daviddm-image]][daviddm-url]
[![Code Climate][codeclimate-image]][codeclimate-url]


Just a customized fork of this one: [https://github.com/langateam/sails-swagger](https://github.com/langateam/sails-swagger)

## Install

```sh
$ npm install sails-swagger-pp --save
```

## Configuration
```js
// config/swagger.js
module.exports.swagger = {
  /**
   * require() the package.json file for your Sails app.
   */
  pkg: require('../package'),
  ui: {
    url: 'http://swagger.balderdash.io'
  }
};
```

## Usage
After installing and configuring swagger, you can find the docs output on the [/swagger/doc](http://localhost:1337/swagger/doc) route.

You can also overload the swagger attributes by adding a `$swagger` attribute on your controllers:

```
/**
 * AuthController
 *
 * @description :: Server-side logic for managing Auths
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
    signIn: function _Authenticate(req, res) {
        ...
    },

    $swagger: {
        signIn: {
            summary: 'Login',
            description: 'Login in the API'
        }
    }
}
```

## License
MIT

## Maintained By
[<img src='http://i.imgur.com/Y03Jgmf.png' height='64px'>](http://langa.io)

[sails-version-image]: https://goo.gl/gTUV5x
[sails-url]: http://sailsjs.org
[npm-image]: https://img.shields.io/npm/v/sails-swagger.svg?style=flat
[npm-url]: https://npmjs.org/package/sails-swagger
[ci-image]: https://img.shields.io/travis/langateam/sails-swagger/master.svg?style=flat
[ci-url]: https://travis-ci.org/langateam/sails-swagger
[daviddm-image]: http://img.shields.io/david/langateam/sails-swagger.svg?style=flat
[daviddm-url]: https://david-dm.org/langateam/sails-swagger
[codeclimate-image]: https://img.shields.io/codeclimate/github/langateam/sails-swagger.svg?style=flat
[codeclimate-url]: https://codeclimate.com/github/langateam/sails-swagger
