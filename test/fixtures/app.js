const _ = require('lodash')
const smokesignals = require('smokesignals')

const Api = require('./api/index')
const fs = require('fs')
const Joi = require('joi')

const App = {
  pkg: {
    name: '@fabrix/express-spool-test',
    version: '1.0.0'
  },
  api: Api,
  config: {
    stores: {
      sequelize: {
        migrate: 'drop',
        orm: 'sequelize',
        database: 'Sequelize',
        host: '127.0.0.1',
        dialect: 'postgres'
      }
    },
    express: {
      cluster: true
    },
    models: {
      defaultStore: 'sequelize',
      migrate: 'drop'
    },
    tapestries: {
      controllers: {
        ignore: ['DefaultController', 'ViewController', 'StandardController']
      },
      models: {

        actions: {
          create: true,
          createWithId: true,
          find: true,
          findOne: true,
          update: true,
          destroy: true,
          createAssociation: true,
          createAssociationWithId: true,
          findAssociation: true,
          findOneAssociation: true,
          updateAssociation: true,
          destroyAssociation: true
        }
      },
      prefix: '/api/v1'
    },
    main: {
      spools: [
        require('@fabrix/spool-errors').ErrorsSpool,
        require('@fabrix/spool-joi').JoiSpool,
        require('@fabrix/spool-router').RouterSpool,
        require('@fabrix/spool-i18n').I18nSpool,
        require('@fabrix/spool-tapestries').TapestriesSpool,
        require('@fabrix/spool-sequelize').SequelizeSpool,
        require('../../dist').ExpressSpool // spool-express
      ]
    },
    routes: {
      '/': {
        'GET': 'ViewController.helloWorld',
        config: {
          cors: {
            origin: ['https://fabrix.app']
          }
        }
      },
      '/default/notFound': {
        'GET': 'DefaultController.notFound'
      },
      '/default/serverError': {
        'GET': 'DefaultController.serverError'
      },
      '/standard/info': {
        'GET': 'StandardController.info'
      },
      '/standard/intercept': {
        'GET': 'StandardController.intercept'
      },
      '/default/info': {
        'GET': 'DefaultController.info',
        'POST': 'DefaultController.echo',
        'PUT': 'DefaultController.echo'
      },
      '/default/policySuccess': {
        'GET': 'DefaultController.policySuccess',
        config: {
          pre: ['Default.success']
        }
      },
      '/default/policyFail': {
        'GET': 'DefaultController.policyFail',
        config: {
          pre: ['Default.fail']
        }
      },
      '/default/policyIntercept': {
        'GET': 'DefaultController.policyIntercept',
        config: {
          pre: ['Default.intercept']
        }
      },
      '/validation/failHeaders': {
        'GET': 'ValidationController.fail',
        config: {
          validate: {
            headers: false
          }
        }
      },
      '/validation/successHeaders': {
        'GET': 'ValidationController.success',
        config: {
          validate: {
            headers: true
          }
        }
      },
      '/validation/:id/failParams': {
        'GET': 'ValidationController.fail',
        config: {
          validate: {
            params: false
          }
        }
      },
      '/validation/:id/successParams': {
        'GET': 'ValidationController.success',
        config: {
          validate: {
            params: true
          }
        }
      },
      '/validation/{id}/successHapiParams': {
        'GET': 'ValidationController.success',
        config: {
          validate: {
            params: true
          }
        }
      },
      '/validation/failQuery': {
        'GET': 'ValidationController.fail',
        config: {
          validate: {
            query: false
          }
        }
      },
      '/validation/successQuery': {
        'GET': 'ValidationController.success',
        config: {
          validate: {
            query: true
          }
        }
      },
      '/validation/failBody': {
        'POST': 'ValidationController.fail',
        config: {
          validate: {
            payload: false
          }
        }
      },
      '/validation/successBody': {
        'POST': 'ValidationController.success',
        config: {
          validate: {
            payload: true
          }
        }
      },
      '/validation/testOrder/:wrongParam': {
        'GET': 'ValidationController.fail',
        'POST': 'ValidationController.fail',
        config: {
          validate: {
            headers: Joi.object({
              'requiredheader': Joi.string().required()
            }).options({
              allowUnknown: true
            }),
            query: Joi.object({
              'wrongQuery': Joi.string().required()
            }),
            params: Joi.object({
              'wrongParam': Joi.number().required()
            }),
            payload: Joi.object({
              'wrongPayload': Joi.string().email().required()
            }),
            body: Joi.object({
              'wrongPayload': Joi.string().email().required()
            })
          }
        }
      },
      '/validation/sendRequestData/:numberParam': {
        'GET': 'ValidationController.sendRequestData',
        'POST': 'ValidationController.sendRequestData',
        config: {
          validate: {
            headers: Joi.object({
              'numberheader': Joi.number()
            }).options({
              allowUnknown: true
            }),
            query: Joi.object({
              number: Joi.number()
            }),
            params: Joi.object({
              numberParam: Joi.number()
            }),
            payload: Joi.object({
              number: Joi.number()
            })
          }
        }
      },
      '/node_modules': {
        'GET': {
          handler: {
            directory: {
              path: 'node_modules/@fabrix/fabrix'
            }
          }
        }
      },
      '/default/routeConfig': {
        'GET': 'DefaultController.routeConfig',
        config: {
          app: {
            customConfig: true,
            results: 'ok'
          }
        }
      },
      '/paginate': {
        'GET': 'DefaultController.paginate'
      },
      '/jsonCriteria': {
        'GET': 'DefaultController.jsonCriteria'
      },
      // Routes that potentially could get out of order from the router.
      '/test/earth': {
        'GET': 'DefaultController.worldController'
      },
      '/test/:planet': {
        'GET': 'DefaultController.planetController'
      },
      '/test/world': {
        'GET': 'DefaultController.worldController'
      }
    },
    web: {
      express: require('express'),
      init: (fabrixApp, expressApp) => {
        expressApp.initOk = true
        return
      },
      cors: true,
      port: 3030,
      portHttp: 3000,
      ssl: {
        key: fs.readFileSync(process.cwd() + '/test/fixtures/ssl/server.key'),
        cert: fs.readFileSync(process.cwd() + '/test/fixtures/ssl/server.crt')
      },
      views: {
        engines: {
          html: 'pug'
        },
        path: 'test/fixtures/views'
      }
    },
    log: {
      logger: new smokesignals.Logger('debug')
    }
  }
}

// _.defaultsDeep(App, smokesignals.FailsafeConfig)
module.exports = App
