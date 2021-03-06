'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _slicedToArray = (function () {
  function sliceIterator(arr, i) {
    var _arr = [];var _n = true;var _d = false;var _e = undefined;try {
      for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
        _arr.push(_s.value);if (i && _arr.length === i) break;
      }
    } catch (err) {
      _d = true;_e = err;
    } finally {
      try {
        if (!_n && _i['return']) _i['return']();
      } finally {
        if (_d) throw _e;
      }
    }return _arr;
  }return function (arr, i) {
    if (Array.isArray(arr)) {
      return arr;
    } else if (Symbol.iterator in Object(arr)) {
      return sliceIterator(arr, i);
    } else {
      throw new TypeError('Invalid attempt to destructure non-iterable instance');
    }
  };
})();

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { 'default': obj };
}

var _hoek = require('hoek');

var _hoek2 = _interopRequireDefault(_hoek);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _spec = require('./spec');

var _spec2 = _interopRequireDefault(_spec);

var methodMap = {
  post: 'Create Object(s)',
  get: 'Read Object(s)',
  put: 'Update Object(s)',
  patch: 'Update Object(s)',
  'delete': 'Destroy Object(s)',
  options: 'Get Resource Options',
  head: 'Get Resource headers'
};

var Transformer = {

  getSwagger: function getSwagger(sails, pkg) {
    var doc = {
      swagger: '2.0',
      info: Transformer.getInfo(pkg),
      host: sails.config.swagger.host,
      tags: Transformer.getTags(sails),
      definitions: Transformer.getDefinitions(sails),
      paths: Transformer.getPaths(sails)
    };
    if (!sails.config.swagger.doc) return doc;
    return _lodash2['default'].merge(doc, sails.config.swagger.doc);
  },

  /**
   * Convert a package.json file into a Swagger Info Object
   * http://swagger.io/specification/#infoObject
   */
  getInfo: function getInfo(pkg) {
    return _hoek2['default'].transform(pkg, {
      'title': 'name',
      'description': 'description',
      'version': 'version',

      'contact.name': 'author',
      'contact.url': 'homepage',

      'license.name': 'license'
    });
  },

  /**
   * http://swagger.io/specification/#tagObject
   */
  getTags: function getTags(sails) {
    var tags = [];
    Object.keys(sails.controllers).forEach(function (identity) {
      var controller = sails.controllers[identity];
      var tag = { name: controller.globalId };

      if (!controller.$swagger) return tags.push(tag);
      if (!controller.$swagger.ignore) tags.push(_lodash2['default'].merge(tag, controller.$swagger));
    });
    return tags;
  },

  /**
   * http://swagger.io/specification/#definitionsObject
   */
  getDefinitions: function getDefinitions(sails) {
    var definitions = _lodash2['default'].transform(sails.models, function (definitions, model, modelName) {
      if (model.swagger && model.swagger.ignore) return;
      definitions[model.identity] = {
        properties: Transformer.getDefinitionProperties(model),
        type: 'object'
      };
    });

    delete definitions['undefined'];

    return definitions;
  },

  getDefinitionProperties: function getDefinitionProperties(model) {
    return _lodash2['default'].mapValues(model.definition, function (def, attrName) {
      if (def.foreignKey) return {
        $ref: '#/definitions/' + def.model
      };

      var property = _lodash2['default'].pick(def, ['type', 'description', 'format']);
      var def2 = _lodash2['default'].clone(_spec2['default'].getPropertyType(property.type));

      if (!model.swagger || !model.swagger[attrName]) return def2;
      return _lodash2['default'].merge(def2, model.swagger[attrName]);
    });
  },

  /**
   * Convert the internal Sails route map into a Swagger Paths
   * Object
   * http://swagger.io/specification/#pathsObject
   * http://swagger.io/specification/#pathItemObject
   */
  getPaths: function getPaths(sails) {
    var routes = sails.router._privateRouter.routes;
    var pathGroups = _lodash2['default'].chain(routes).values().flatten().unique(function (route) {
      return route.path + route.method + JSON.stringify(route.keys);
    }).reject({ path: '/*' }).reject({ path: '/__getcookie' }).reject({ path: '/csrfToken' }).reject({ path: '/csrftoken' }).groupBy('path').mapKeys(function (_, path) {
      return path.replace(/:(\w+)\??/g, '{$1}');
    }).value();

    var paths = _lodash2['default'].mapValues(pathGroups, function (pathGroup, key) {
      var pathItem = Transformer.getPathItem(sails, pathGroup, key);
      return _lodash2['default'].isEmpty(pathItem) ? undefined : pathItem;
    });

    return Transformer.removeAllUndefinedAttributes(paths, false);
  },

  getModelFromPath: function getModelFromPath(sails, path) {
    var split = path.split('/');

    var _path$split = path.split('/');

    var _path$split2 = _slicedToArray(_path$split, 5);

    var $ = _path$split2[0];
    var parentModelName = _path$split2[1];
    var parentId = _path$split2[2];
    var childAttributeName = _path$split2[3];
    var childId = _path$split2[4];

    var parentModel = sails.models[parentModelName];
    var parentIdModel = sails.models[parentId];
    var childAttribute = _lodash2['default'].get(parentModel, ['attributes', childAttributeName]);
    var childModelName = _lodash2['default'].get(childAttribute, 'collection') || _lodash2['default'].get(childAttribute, 'model');
    var childModel = sails.models[childModelName];

    return childModel || parentModel || parentIdModel;
  },

  /**
   * http://swagger.io/specification/#definitionsObject
   */
  getDefinitionReference: function getDefinitionReference(sails, path) {
    var model = Transformer.getModelFromPath(sails, path);
    if (model) {
      return '#/definitions/' + model.identity;
    }
  },

  /**
   * http://swagger.io/specification/#pathItemObject
   */
  getPathItem: function getPathItem(sails, pathGroup, pathkey) {
    var methodGroups = _lodash2['default'].chain(pathGroup).indexBy('method').pick(['get', 'post', 'put', 'head', 'options', 'patch', 'delete']).value();

    var pathItem = _lodash2['default'].mapValues(methodGroups, function (methodGroup, method) {
      var operation = Transformer.getOperation(sails, methodGroup, method);
      return Transformer.mergeOperationWithCustom(sails, methodGroup, operation);
    });

    return Transformer.removeAllUndefinedAttributes(pathItem, true);
  },

  mergeOperationWithCustom: function mergeOperationWithCustom(sails, methodGroup, operation) {
    var route = sails.config.routes['* ' + methodGroup.path];
    if (!route) route = sails.config.routes[methodGroup.method.toUpperCase() + ' ' + methodGroup.path];
    if (!route) route = sails.config.routes[methodGroup.method.toLowerCase() + ' ' + methodGroup.path];
    if (!route) route = sails.config.routes[methodGroup.path];
    if (!route || !route.swagger) return operation;
    if (route.swagger.ignore) return undefined;
    return _lodash2['default'].merge(operation, route.swagger);
  },

  removeAllUndefinedAttributes: function removeAllUndefinedAttributes(object, checkInTree) {
    return _lodash2['default'].transform(object, function (res, v, k) {
      if (k === 'ignore' && v) res[k] = v;else if (typeof v === 'object' && checkInTree) v = Transformer.removeAllUndefinedAttributes(v, checkInTree);
      if (v) res[k] = v;
    });
  },

  /**
   * http://swagger.io/specification/#operationObject
   */
  getOperation: function getOperation(sails, methodGroup, method) {
    return {
      summary: methodMap[method],
      consumes: ['application/json'],
      produces: ['application/json'],
      parameters: Transformer.getParameters(sails, methodGroup),
      responses: Transformer.getResponses(sails, methodGroup),
      tags: Transformer.getPathTags(sails, methodGroup)
    };
  },

  /**
   * A list of tags for API documentation control. Tags can be used for logical
   * grouping of operations by resources or any other qualifier.
   */
  getPathTags: function getPathTags(sails, methodGroup) {
    return _lodash2['default'].unique(_lodash2['default'].compact([Transformer.getPathModelTag(sails, methodGroup), Transformer.getPathControllerTag(sails, methodGroup), Transformer.getControllerFromRoute(sails, methodGroup)]));
  },

  getPathModelTag: function getPathModelTag(sails, methodGroup) {
    var model = Transformer.getModelFromPath(sails, methodGroup.path);
    return model && model.globalId;
  },

  getPathControllerTag: function getPathControllerTag(sails, methodGroup) {
    var _methodGroup$path$split = methodGroup.path.split('/');

    var _methodGroup$path$split2 = _slicedToArray(_methodGroup$path$split, 2);

    var $ = _methodGroup$path$split2[0];
    var pathToken = _methodGroup$path$split2[1];

    return _lodash2['default'].get(sails.controllers, [pathToken, 'globalId']);
  },

  getControllerFromRoute: function getControllerFromRoute(sails, methodGroup) {
    var route = sails.config.routes[methodGroup.method + ' ' + methodGroup.path];
    if (!route) route = sails.config.routes[methodGroup.path];
    if (!route) return;

    var pattern = /(.+)Controller/;
    var controller = route.controller || _lodash2['default'].isString(route) && route.split('.')[0];

    if (!controller) return;

    var _Controller$exec = /(.+)Controller/.exec(controller);

    var _Controller$exec2 = _slicedToArray(_Controller$exec, 2);

    var $ = _Controller$exec2[0];
    var name = _Controller$exec2[1];

    return name;
  },

  /**
   * http://swagger.io/specification/#parameterObject
   */
  getParameters: function getParameters(sails, methodGroup) {
    var routeParams = methodGroup.keys;

    var parameters = _lodash2['default'].map(routeParams, function (param) {
      return { name: param.name, 'in': 'path', required: true, type: 'string' };
    });

    if (methodGroup.method === 'post' && !methodGroup.path.match(/:id\?*$/) || methodGroup.method === 'put') {
      var $ref = Transformer.getDefinitionReference(sails, methodGroup.path);
      if ($ref) {
        var body = { name: 'Body', 'in': 'body', required: true };
        body.schema = { '$ref': $ref };
        parameters.push(body);
      }
    }

    return parameters;
  },

  /**
   * http://swagger.io/specification/#responsesObject
   */
  getResponses: function getResponses(sails, methodGroup) {
    var $ref = Transformer.getDefinitionReference(sails, methodGroup.path);
    var ok = { description: 'The requested resource' };
    if ($ref) ok.schema = { '$ref': $ref };

    return {
      '200': ok,
      '400': { description: 'Bad request' },
      '500': { description: 'Internal server error' }
    };
  }
};

exports['default'] = Transformer;
module.exports = exports['default'];