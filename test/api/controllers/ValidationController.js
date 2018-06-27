'use strict'
require('@fabrix/fabrix')

/**
   * @module DefaultController
   *
   * @description Default Controller included with a new fabrix app
   * @see {@link http://fabrix.app/doc/api/controllers}
   * @this fabrixApp
   */
module.exports = class ValidationController extends Controller {
  fail(req, res) {
    res.status(200).json()
  }
  success(req, res) {
    res.status(200).json()
  }
  sendRequestData(req, res) {
    res.status(200).json({
      headers: req.headers,
      query: req.query,
      params: req.params,
      body: req.body
    })
  }
}
