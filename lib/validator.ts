import * as joi from 'joi'
import { webConfig } from './schemas/webConfig'

export const Validator = {
  /**
   * Validate the structure of the web config
   */
  validateWebConfig (config) {
    return new Promise((resolve, reject) => {
      joi.validate(config, webConfig, (err, value) => {
        if (err) {
          return reject(new TypeError('config.web: ' + err))
        }

        return resolve(value)
      })
    })
  }
}
