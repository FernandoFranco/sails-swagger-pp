[![Sails][sails-image]][sails-url]

# sails-swagger-pp

[![NPM version][npm-image]][npm-url]
<!--[![Build status][ci-image]][ci-url]-->
<!--[![Dependency Status][daviddm-image]][daviddm-url]-->
<!--[![Code Climate][codeclimate-image]][codeclimate-url]-->

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
  },
  // Optional - Override swagger doc attributes
  doc: {
    basePath: '/api',
    host: 'http://localhost',
    info: {
      title: 'My API'
    }
  }
};
```

## Usage
After installing and configuring swagger, you can find the docs output on the [/swagger/doc](http://localhost:1337/swagger/doc) route.

You can also overload the swagger attributes by adding a `swagger` attribute on yours routes:

```js
/**
 * Route Mappings
 * (sails.config.routes)
 *
 * Your routes map URLs to views and controllers.
 *
 * If Sails receives a URL that doesn't match any of the routes below,
 * it will check for matching files (images, scripts, stylesheets, etc.)
 * in your assets directory.  e.g. `http://localhost:1337/images/foo.jpg`
 * might match an image file: `/assets/images/foo.jpg`
 *
 * Finally, if those don't match either, the default 404 handler is triggered.
 * See `api/responses/notFound.js` to adjust your app's 404 logic.
 *
 * Note: Sails doesn't ACTUALLY serve stuff from `assets`-- the default Gruntfile in Sails copies
 * flat files from `assets` to `.tmp/public`.  This allows you to do things like compile LESS or
 * CoffeeScript for the front-end.
 *
 * For more information on configuring custom routes, check out:
 * http://sailsjs.org/#!/documentation/concepts/Routes/RouteTargetSyntax.html
 */

module.exports.routes = {

  /***************************************************************************
   *                                                                          *
   * Make the view located at `views/homepage.ejs` (or `views/homepage.jade`, *
   * etc. depending on your default view engine) your home page.              *
   *                                                                          *
   * (Alternatively, remove this and add an `index.html` file in your         *
   * `assets` directory)                                                      *
   *                                                                          *
   ***************************************************************************/

    '/': {
        view: 'homepage'
    },

  /***************************************************************************
   *                                                                          *
   * Custom routes here...                                                    *
   *                                                                          *
   * If a request to a URL doesn't match any of the custom routes above, it   *
   * is matched against Sails route blueprints. See `config/blueprints.js`    *
   * for configuration options and examples.                                  *
   *                                                                          *
   ***************************************************************************/
   
    '* /swagger/ui': {
        swagger: {
            ignore: true
        }
    },

    'post /api/auth': {
        controller: 'AuthController',
        action: 'signIn',
        swagger: {
            summary: 'Login',
            description: 'Login in the API'
        }
    },
}
```

## License
MIT

[sails-image]: http://i.imgur.com/RIvu9.png
[sails-url]: http://sailsjs.org
[npm-image]: https://img.shields.io/npm/v/sails-swagger-pp.svg
[npm-url]: https://npmjs.org/package/sails-swagger-pp
[ci-image]: https://img.shields.io/travis/FernandoFranco/sails-swagger-pp/master.svg?style=flat
[ci-url]: https://travis-ci.org/FernandoFranco/sails-swagger-pp
[daviddm-image]: http://img.shields.io/david/FernandoFranco/sails-swagger-pp.svg?style=flat
[daviddm-url]: https://david-dm.org/FernandoFranco/sails-swagger-pp
[codeclimate-image]: https://img.shields.io/codeclimate/github/FernandoFranco/sails-swagger-pp.svg?style=flat
[codeclimate-url]: https://codeclimate.com/github/FernandoFranco/sails-swagger-pp
