
declare namespace Express {
  interface Boom {
    // Add boom's properties in here
    wrap: any
  }

  export interface Response {
    boom: Boom
    serverError: any
    notFound: any
    forbidden: any
    paginate: any
  }
  export interface Request {
    wantsJSON: any
    error: any
    log: any
    fabrixApp: any
    jsonCriteria: any
  }
}
