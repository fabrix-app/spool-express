/**
 * spool Configuration
 *
 * This manifest declares the application resources which are provided and/or
 * modified by this spool.
 */
export const spool = {
  provides: {},
  lifecycle: {
    initialize: {
      listen: ['spool:router:initialized'],
      emit: ['webserver:http:ready']
    }
  }
}
