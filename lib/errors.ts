import { uniq, flatten, map } from 'lodash'

export class ValidationError extends Error {
  public error
  public statusCode
  public validation

  constructor(error) {

    super(error)

    console.log('BROKE', error.details)
    // flat all errors for hapi like validation error response
    const flat = error.details.map(details => {
      return {
        key: details.context.key,
        source: details.path[0] // .split('.')[0] Joi 13 now provides this pre split
      }
    })
    const source = uniq(flatten(map(flat, 'source')))[0]

    error.name = ''
    this.name = error.toString()
    this.error = 'Bad Request'
    this.statusCode = '400'
    delete this.message // weird fix, we shouldn't do this
    this.message = error.details[0].message
    this.validation = {
      key: flatten(map(flat, 'key')),
      source: source === 'body' ? 'payload' : source
    }
  }
}
