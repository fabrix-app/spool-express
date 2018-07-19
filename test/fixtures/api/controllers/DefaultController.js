'use strict'
require('@fabrix/fabrix')
/**
   * @module DefaultController
   *
   * @description Default Controller included with a new fabrix app
   * @see {@link http://fabrix.app/doc/api/controllers}
   * @this fabrixApp
   */
module.exports = class DefaultController extends Controller {
  notFound(req, res) {
    res.notFound()
  }
  serverError(req, res) {
    res.serverError()
  }
  info(req, res) {
    res.status(200).json(this.app.services.DefaultService.getApplicationInfo())
  }
  policySuccess(req, res) {
    res.status(200).json(this.app.services.DefaultService.getApplicationInfo())
  }
  policyFail(req, res) {
    res.status(200).json(this.app.services.DefaultService.getApplicationInfo())
  }
  policyIntercept(req, res) {
    res.status(200).json(this.app.services.DefaultService.getApplicationInfo())
  }
  echo(req, res) {
    res.status(200).json(req.body)
  }
  routeConfig(req, res) {
    res.status(200).json(req.route.config)
  }
  paginate(req, res) {
    res.paginate(10, 10, 10, []).json({})
  }
  jsonCriteria(req, res) {
    const where = req.jsonCriteria(req.query.where)
    res.json(where)
  }
  worldController(req, res) {
    const where = req.jsonCriteria(req.query.where)
    res.json({world: where})
  }
  planetController(req, res) {
    const where = req.jsonCriteria(req.query.where)
    res.json({[req.params.planet]: where})
  }
}
