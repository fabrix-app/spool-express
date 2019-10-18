declare namespace Express {
  export interface Boom {
    // Add boom's properties in here
    // wrap: any
    [key: string]: any
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
