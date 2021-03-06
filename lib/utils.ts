import { FabrixApp } from '@fabrix/fabrix'
import { FabrixController as Controller } from '@fabrix/fabrix/dist/common/Controller'
import { FabrixPolicy as Policy } from '@fabrix/fabrix/dist/common/Policy'
// import Joi from '@hapi/joi'
import  methods from 'methods'
import { isPlainObject, get } from 'lodash'
import { Request, Response } from 'express'

import http from 'http'

export const Utils = {
  extendsExpressRouter: (app: FabrixApp) => {
    methods.concat('all').forEach(function (method) {
      const originalMethod = app[method]
      app[method] = function (key) {
        const args = [].slice.call(arguments)
        const config = args[1]

        // Check if second argument is the route config object
        if (isPlainObject(config)) {
          args[1] = function (req, res, next) {
            req.route.config = config
            next()
          }
        }
        return originalMethod.apply(this, args)
      }
    })
  },
  /**
   * Checks if Standard Route
   * @param obj
   * @returns {*}
   */
  isFabrixStandard: function(obj) {
    const className = obj.constructor.name
    if (
      className === Controller.name
      || className === Policy.name
    ) {
      return true
    }
    else if (className === 'Object') {
      return false
    }
    else {
      return this.isFabrixStandard(obj.__proto__)
    }
  },
  /**
   * Transform express request to hapi like request
   * @param req as express
   * @param res as express
   * @returns request hapi like object
   */
  createRequest: function(req: Request, res: Response) {
    return {
      raw: {
        req: req,
        res: res
      },
      params: req.params,
      payload: req.body,
      query: req.query,
      headers: req.headers,
      route: req.route,
      url: req.url
    }
  },
  /**
   * Transform express response to hapi like response
   * @param req as express
   * @param res as express
   * @param next as express
   * @returns response hapi like object
   */
  createResponse: function(req: Request, res: Response, next) {
    const response: any = (data: any) => {

      return new Promise((resolve, reject) => {
        if (!data) {
          next()
        }
        else if (data instanceof <any>Error) {
          if (!data.output) {
            data.output = {}
          }
          const code = data.code || data.output.statusCode
          res.status(code || 500).send(data.message)
        }
        else {
          res.send(data)
        }
        resolve()
      })
    }

    response.continue = () => {
      return new Promise((resolve, reject) => {
        next()
        resolve()
      })
    }

    response.header = (key, value) => {
      return new Promise((resolve, reject) => {
        res.set(key, value)
        resolve()
      })
    }

    return response
  },

  /**
   * Returnn an hapi like validation middleware for epxress
   */
  createJoiValidationRules: function(app: FabrixApp, route) {
    const joi = app.validator
    route.config.validate.body = route.config.validate.body // express compatibility
      || route.config.validate.payload // hapi compatibility

    const validation = get(route, 'config.validate', null)
    const types = ['headers', 'params', 'query', 'body']
    types.forEach((type) => {
      let rule = validation[type]

      const schemaCheck = function (_rule) {
        if (_rule && _rule.isJoi) {
          return true
        }
        else if (joi.isSchema && joi.isSchema(_rule)) {
          return true
        }
        else {
          return false
        }
          // typeof Joi.isJoi !== 'undefined' ? Joi.isJoi : Joi.isSchema
      }
      // null, undefined, true - anything allowed
      // false - nothing allowed
      // {...} - ... allowed
      rule = (rule === false
        // The allow a null object
        ? joi.object({}).allow(null)
        // If already a joi schema, use the schema
        : schemaCheck(rule)
          ? rule
          // If a function, use the function
          : typeof rule === 'function'
            ? rule
            // If nothing, then just allow anything as the schema
            : !rule || rule === true
              ? joi.any()
              // Otherwise, compile the rule
              : joi.compile(rule))

      validation[type] = rule
    })
    return validation
  }
}
