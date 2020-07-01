import joi from '@hapi/joi'

export const expressConfig = joi.object().keys({
  helmet: joi.any(),
  cluster: joi.any()
}).unknown()
