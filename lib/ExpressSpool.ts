import { ServerSpool } from '@fabrix/fabrix/dist/common/spools/server'
import * as _ from 'lodash'
import { Express } from 'express'

import { Server } from './server'
import { Validator } from './validator'

import * as config from './config/index'
import * as pkg from '../package.json'
import * as api  from './api/index'


/**
 * Express spool
 *
 * @class Express
 * @see {@link http://fabrix.app/doc/spool}
 *
 * Bind application routes to Express.js (from spool-router)
 */
export class ExpressSpool extends ServerSpool {
  public server: Express

  constructor(app) {
    super(app, {
      config: config,
      pkg: pkg,
      api: api
    })
  }

  /**
   * Ensure that config/web is valid, and that no other competing web
   * server spools are installed (e.g. express)
   */
  async validate () {
    const serverSpools = ['hapi', 'loa', 'koa2', 'restify']
    const spools = Object.keys(this.app.config.get('main.spools'))

    if (serverSpools.some(v => spools.indexOf(v) >= 0)) {
      return Promise.reject(
        new Error('There is another web services spool installed that conflicts with spool-express!')
      )
    }
    if (!this.app.config.get('web.express')) {
      return Promise.reject(
        new Error(
          'config.web.express is absent, '
          + 'please npm install your express version (4 or 5) and uncomment the line under config.web.express'
        )
      )
    }

    return Promise.all([
      Validator.validateWebConfig(this.app.config.get('web'))
    ])
  }

  configure () {
    this.app.config.set('web.server', 'express')
  }

  /**
   * Start Express Server
   */
  async initialize () {

    this.server = Server.createServer(this.app)

    return Promise.all([
      Server.registerMiddlewares(this.app, this.server),
      Server.registerViews(this.app, this.server)
    ])
      .then(() => {
        return Server.start(this.app, this.server)
      })
      .then(() => {
        this.app.emit('webserver:http:ready', Server.nativeServer)
      })
  }

  async unload () {
    if (Server.nativeServer === null) {
      return
    }
    else if (_.isArray(Server.nativeServer)) {
      Server.nativeServer.forEach(server => {
        server.close()
      })
    }
    else {
      Server.nativeServer.close()
    }
    return Promise.resolve()
  }
}
