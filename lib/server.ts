import { FabrixApp } from '@fabrix/fabrix'
import { Express, Request, Response } from 'express'
import { Utils as RouterUtils } from '@fabrix/spool-router'
import { Utils } from './utils'
import { defaults, isArray, isString, each, isPlainObject } from 'lodash'
import cors from 'cors'
import { join } from 'path'
import http from 'http'
import https from 'https'
import Joi from 'joi'
import session from 'express-session'
import consolidate from 'consolidate'
import Boom from '@hapi/boom'


// THIS FUNCTIONALITY IS GOING TO BE ADDED TO SPOOL-CLUSTER/Fabrix Core
// Fork processes for each CPU
// import cluster from 'cluster'
// import { cpus } from 'os'
//
// // Count the number of CPUs
// const numCPUs = cpus().length

export interface Server {
  [key: string]: any
  nativeServers: Map<string, {host: string, port: number, server: any}>
}

export const Server: Server = {
  BreakException: {},
  port: null, // process.env.PORT,
  portHttp: null,
  host: null,
  ssl: null,
  redirectToHttps: false,
  nativeServers: new Map(),
  serverRoutes: {},
  serverPolicies: {},
  serverHandlers: {},
  webConfig: {},
  middlewares: {},
  middlewaresOrder: [],

  createExpressServer(app: FabrixApp) {
    const main = app.config.get('main')
    const sess = app.config.get('session')
    const express = app.config.get('web.express')

    if (!express) {
      throw new Error('Express Web Server was not in app.config.web.express')
    }

    const server = express()

    this.webConfig = Object.assign({}, app.config.get('web'))
    this.middlewares = app.config.get('web.middlewares') || {}
    this.middlewaresOrder = Object.values(app.config.get('web.middlewares.order') || [])
    this.port = this.webConfig.port
    this.portHttp = this.webConfig.portHttp
    this.host = this.webConfig.host
    this.ssl = this.webConfig.ssl
    this.externalConfig = this.webConfig.externalConfig
    this.cors = this.webConfig.cors
    this.redirectToHttps = this.webConfig.redirectToHttps || false

    if (main.paths && main.paths.www) {
      // app.config.set('web.middlewares.www', express.static(main.paths.www, {
      //   maxAge: this.webConfig.cache
      // }))
      this.middlewares.www = express.static(main.paths.www, {
        maxAge: this.webConfig.cache
      })
    }
    else {
      app.log.info('config.paths.www: No www directory is set, www middleware will not be loaded')
    }

    if (sess && sess.secret) {
      this.middlewares.session = session(defaults({
        secret: sess.secret,
        store: sess.store,
        resave: true,
        saveUninitialized: false
      }, sess.options))
    }
    else {
      app.log.info('config.session.secret: No secret given so session are disabled')
    }

    if (!this.middlewares.addMethods) {
      this.middlewares.addMethods = (req: Request, res: Response, next) => {
        req.log = app.log
        req.fabrixApp = app

        const accept = req.get('accept') || ''
        req.wantsJSON = accept.indexOf('json') !== -1

        req.jsonCriteria = (str) => {
          if (!str) {
            return {}
          }
          if (str instanceof Object) {
            return str
          }
          try {
            str = JSON.parse(str)
          }
          catch (err) {
            str = {}
          }
          return str
        }

        // Helper 500
        if (!res.serverError) {
          res.serverError = err => {
            this.middlewares['500'](err, req, res, next)
          }
        }

        // Helper 404
        if (!res.notFound) {
          res.notFound = () => {
            this.middlewares['404'](req, res, next)
          }
        }

        // Helper 403
        if (!res.forbidden) {
          res.forbidden = (msg) => {
            res.serverError({
              statusCode: 403,
              code: 'E_FORBIDDEN',
              message: msg || 'forbidden'
            })
          }
        }

        // Helper Paginate Utility
        if (!res.paginate) {
          res.paginate = (count, limit = 0, offset = 0, sort = []) => {
            limit = Number(limit)
            offset = Number(offset)

            const pages = Math.ceil(count / limit) === 0 ? 1 : Math.ceil(count / limit)
            const page = Math.round(((offset + limit) / limit))

            res.set('X-Pagination-Total', count)
            res.set('X-Pagination-Pages', pages.toString())
            res.set('X-Pagination-Page', page.toString())
            res.set('X-Pagination-Offset', offset.toString())
            res.set('X-Pagination-Limit', limit.toString())
            res.set('X-Pagination-Sort', Server.sortToString(sort))
            return res
          }
        }

        next()
      }
    }

    return server
  },

  /**
   * This shouldn't be here!
   * @param sort
   */
  sortToString(sort = []) {
    if (typeof sort === 'string') {
      return sort
    }
    let res = sort.reduce((r, a) => {
      if (!Array.isArray(a)) {
        return a
      }
      const s = a.reduce((_res, v) => {
        const val = Array.isArray(v) ? `["${v.join('","')}"]` : v
        _res.push(val)
        return _res
      }, [])
      return `["${r + s.join('","')}"]`
    }, '')
    res = `[${ res }]`
    return res
  },
  /**
   * Register middlewares
   * @param server express server
   * @param app fabrix app
   */
  registerMiddlewares(app: FabrixApp, server: Express) {

    // Add Boom as middleware so that errors will be consitent between both Express, Hapi, Koa, Polka, etc.
    server.use(function(req, res, next) {
      res.boom = Boom
      next()
    })

    if (this.cors) {
      server.use(cors(this.cors === true ? {} : this.cors))
    }

    // for (const index of Object.keys(this.webConfig.middlewares.order || {})) {
    this.middlewaresOrder.forEach((middlewareName, index) => {
      // const middlewareName = this.webConfig.middlewares.order[index]
      const middleware = this.middlewares[middlewareName]

      try {
        if (!middleware && middlewareName !== 'router') {
          // throw Server.BreakException
          // continue
        }

        if (isArray(middleware)) {
          if (isString(middleware[0])) {
            server.use.apply(server, middleware)
          }
          else {
            for (const i of Object.keys(middleware)) {
              const m = middleware[i]
              server.use(m)
            }
          }
        }
        else if (middlewareName === 'router') {
          this.registerRoutes(app, server)
        }
        else if (middleware) {
          server.use(middleware)
        }
      }
      catch (e) {
        if (e !== Server.BreakException) {
          throw e
        }
      }
    })
  },

  /**
   * Register template engines and views path
   * @param server express server
   * @param app fabrix app
   */
  registerViews(app: FabrixApp, server) {
    const viewEngine = app.config.get('views.engine') || null
    const viewEngines = app.config.get('web.views')

    if (!viewEngine && !viewEngines) {
      app.log.info('No view engine is set')
      return
    }

    if (viewEngines) {
      let defaultExt
      for (const ext of Object.keys(viewEngines.engines)) {
        if (!defaultExt) {
          defaultExt = ext
        }
        server.engine(ext, consolidate[viewEngines.engines[ext]] ? consolidate[viewEngines.engines[ext]] : viewEngines.engines[ext])
      }

      if (defaultExt) {
        server.set('view engine', defaultExt)
      }

      server.set('views', join(process.cwd(), viewEngines.path))
    }
    else {
      server.engine('html', consolidate[viewEngine] ? consolidate[viewEngine] : viewEngine)
      server.set('view engine', 'html')
      server.set('views', join(process.cwd(), 'views'))
    }
  },

  /**
   * Register routes to express server
   */
  registerRoutes(app: FabrixApp, server: Express) {
    // Sort the routes so that they are always in the correct express order.
    // Could be related to https://github.com/fabrix-app/spool-router/issues/6
    const routes = new Map([...app.routes].reverse())
    const express = app.config.get('web.express')
    const expressRouter = express.Router
    const router = expressRouter()
    Utils.extendsExpressRouter(router)

    if (this.ssl && this.redirectToHttps) {
      router.all('*', (req, res, next) => {
        if (req.secure) {
          return next()
        }
        res.redirect(`https://${req.hostname}:${this.port + req.url}`)
      })
    }

    routes.forEach((route, r) => {

      RouterUtils.methods.forEach(m => {
        if (route[m]) {
          this.serverRoutes[m.toLowerCase() + ' ' + r] = {
            ...route[m],
            path: r
          }
        }
      })
    })

    each(this.serverRoutes, (route, path) => {
      const parts = path.split(' ')

      let methods = []

      // Handler is object configuration
      if (isPlainObject(route.handler)) {
        if (route.handler.directory && route.handler.directory.path) {
          router.use(parts[1], express.static(route.handler.directory.path))
        }
        else {
          app.log.warn(`${path} will be ignored because it doesn't have a correct handler configuration`)
        }
      }
      else {
        if (route.config) {
          if (route.config.validate && Object.keys(route.config.validate).length > 0) {

            // add validation
            const validation = Utils.createJoiValidationRules(route)

            methods = methods.concat((req, res, next) => {
              // validate request
              // the request is sequentially validate the headers, params, query, and oby
              Joi.validate({
                headers: req.headers,
                params: req.params,
                query: req.query,
                body: req.body
              }, validation, (err, result) => {
                if (err) {
                  // return the first error
                  return next(new app.errors.ExpressValidationError(err))
                }
                else {
                  req.headers = result.headers
                  req.params = result.params
                  Object.defineProperty(req, 'query', { value: result.query })
                  req.body = result.body
                  next()
                }
              })
            })
          }

          // If route has cors configuration,
          if (route.config.cors) {
            methods.push(cors(route.config.cors === true ? {} : route.config.cors))
          }

          // If a route has "pre" policies to run, these run before global policies (but maybe they shouldn't?)
          // TODO figure out a way to configure when these run.
          if (
            route.config.pre
            && route.config.pre.length > 0
          ) {
            methods = methods.concat(route.config.pre)
          }

        }

        // Push the handler
        methods.push(route.handler)

        // Set route config as params to keep it on handlers
        methods.unshift(route.config)

        // Format route to express protocol, maybe `spool-router` will do this in the future
        methods.unshift(route.path.replace(/{/g, ':').replace(/}/g, ''))

        // Filter out undefined
        methods = methods.filter(m => m)

        // Applies the route methods
        router[parts[0]].apply(router, methods)
      }
    })
    server.use(router)
    return router
  },

  /**
   * Start express server
   * @param server express server
   * @param app fabrix application
   */
  start(app, server) {
    const init = app.config.get('web.init')

    if (!init) {
      const err = new Error('web.init is not defined and express can not start')
      return Promise.reject(err)
    }
    if (typeof init !== 'function') {
      const err = new Error('web.init is not a function and express can not start')
      return Promise.reject(err)
    }

    // Initialize a server
    init(app, server)

    const promises = Array.from(this.nativeServers.values())
      .map((s) => {
        return Server.listenPromise(app, s)
      })

    return Promise.all(promises)
  },

  /**
   *
   * @param app
   * @param server
   */
  createNativeServers(app, server) {
    return new Promise((resolve, reject) => {
      if (this.externalConfig) {
        return this.externalConfig(app, server)
          .then(servers => {
            this.nativeServers = new Map(servers)
            resolve()
          })
          .catch(reject)
      }
      else if (this.ssl) {
        this.nativeServers.set('https', {
          server: https.createServer(this.ssl, server),
          host: this.host,
          port: this.port,
        })
        if (this.redirectToHttps || this.portHttp) {
          this.nativeServers.set('http', {
            server: http.createServer(server),
            host: this.host,
            port: this.portHttp || this.port,
          })
        }
        return resolve()
      }
      else {
        this.nativeServers.set('http', {
          server: http.createServer(server),
          host: this.host,
          port: this.portHttp || this.port,
        })
        return resolve()
      }
    })
  },

  /**
   * Log out when a given server binds to port
   * @param app
   * @param config
   */
  listenPromise(app: FabrixApp, config: {host: string, port: number, server: any}) {
    return new Promise((resolve, reject) => {
      config.server.listen(config.port, config.host, function (err) {
        if (err) {
          reject(err)
        }
        app.log.info(`express: ${config.host} listening on ${config.port}`)
        resolve()
      })
    })
  }
}
