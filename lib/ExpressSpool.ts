import { ServerSpool } from '@fabrix/fabrix/dist/common/spools/server'
import { SanityError } from '@fabrix/fabrix/dist/errors'
import { Express } from 'express'
import helmet from 'helmet'

import { Server } from './server'
import { Validator } from './validator'

import * as config from './config/index'
import * as pkg from '../package.json'
import * as api  from './api/index'
import { ConfigError } from './errors'



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
    const requiredSpools = ['router', 'i18n', 'errors']
    const spools = Object.keys(this.app.spools)

    if (!spools.some(v => requiredSpools.indexOf(v) === -1)) {
      return Promise.reject(new ConfigError('E_PRECONDITION_FAILED', `spool-express requires spools: ${ requiredSpools.join(', ') }!`))
    }
    if (!this.app.config.get('web.express')) {
      return Promise.reject(
        new ConfigError(
          'E_PRECONDITION_FAILED',
          'config.web.express is absent, '
          + 'please npm install your express version (4 or 5) and uncomment the line under config.web.express'
        )
      )
    }

    return Promise.all([
      Validator.validateExpress(this.app.config.get('express')),
      Validator.validateWebConfig(this.app.config.get('web'))
    ])
      .catch(err => {
        return Promise.reject(err)
      })
  }

  configure () {
    // Set a config that let's other spools know this is using express as a webserver
    this.app.config.set('web.server', 'express')

    // Set helmet for express if it is not explicitly disabled or already defined
    if (
      this.app.config.get('express.helmet') !== false
      && !this.app.config.get('web.middlewares.helmet')
    ) {
      this.app.config.set('web.middlewares.helmet', helmet(this.app.config.get('express.helmet')))
    }
  }

  /**
   * Start Express Server
   */
  async initialize () {

    this.server = Server.createExpressServer(this.app)

    return Promise.all([
      Server.registerMiddlewares(this.app, this.server),
      Server.registerViews(this.app, this.server)
    ])
      .then(() => {
        return Server.createNativeServers(this.app, this.server)
      })
      .then(() => {
        // Certain spools await this event, so it must be emitted each time a server is spawned,
        // eg. see spool-realtime
        this.app.emit(
          'webserver:http',
          Array.from(Server.nativeServers.values()).map(s => s.server)
        )
        return Server.start(this.app, this.server)
      })
      .then(() => {
        // Certain spools await this event, so it must be emitted each time a server is spawned,
        // eg. see spool-realtime
        this.app.emit(
          'webserver:http:ready',
          Array.from(Server.nativeServers.values()).map(s => s.server)
        )
        return
      })
      .catch(err => {
        return Promise.reject(err)
      })
  }

  /**
   * Stops the Server(s)
   */
  async unload () {

    this.app.emit(
      'webserver:http:stopping',
      Array.from(Server.nativeServers.values()).map(s => s.server)
    )

    if (Server.nativeServers.size === 0) {
      return
    }
    else {
      Array.from(Server.nativeServers.values()).forEach(s => {
        s.server.close()
      })
    }

    return Promise.resolve()
  }

  /**
   *
   */
  sanity() {
    if (!(this.app.routes instanceof Object)) {
      throw new Error('Sanity Failed: app.routes is not an object!')
    }
    if (
      this.app.config.get('express.helmet') !== false
      && !this.app.config.get('web.middlewares.helmet')
    ) {
      throw new SanityError('Sanity Failed: Helmet was not set on web.middlware when configured at express.helmet')
    }
  }
}
