/**
 * Spool Configuration
 *
 * This manifest declares the application resources which are provided and/or
 * modified by this spool.
 * @see {@link https://fabrix.app/doc/spool/config
 */
export const spool = {
  provides: {
    resources: [
      'controllers',
      'policies'
    ],
    api: {
      controllers: [
        'TapestryController'
      ],
      policies: [
        'TapestryPolicy'
      ]
    },
    config: [
      'session',
      'web',
      'locales'
    ]
  },
  /**
   * Configure the lifecycle of this pack; that is, how it boots up, and which
   * order it loads relative to other spools.
   */
  lifecycle: {
    initialize: {
      listen: ['spool:router:initialized'],
      emit: ['webserver:http:ready']
    }
  }
}
