import joi from '@hapi/joi'
import { webConfig } from './schemas/webConfig'
import { expressConfig } from './schemas/expressConfig'

export const Validator = {
  /**
   * Validate the structure of the web config
   */
  validateWebConfig (config) {
    // return joi.validateAsync(config, webConfig)
    return new Promise((resolve, reject) => {
      joi.validate(config, webConfig, (err, value) => {
        if (err) {
          return reject(new TypeError('config.web: ' + err))
        }

        return resolve(value)
      })
    })
  },
  validateExpress (config) {
    // return joi.validateAsync(config, expressConfig)
    return new Promise((resolve, reject) => {
      joi.validate(config, expressConfig, (err, value) => {
        if (err) {
          return reject(new TypeError('config.express: ' + err))
        }

        return resolve(value)
      })
    })
  }
}
