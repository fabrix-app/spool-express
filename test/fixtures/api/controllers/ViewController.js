'use strict'
const Controller = require('@fabrix/fabrix/dist/common').FabrixController

module.exports = class ViewController extends Controller{
  helloWorld (req, res) {
    res.render('index.pug', {
      title: 'Test',
      message: 'helloWorld'
    })
  }
}
