'use strict'
require('@fabrix/fabrix')

module.exports = class ViewController extends Controller{
  helloWorld (req, res) {
    res.render('index.pug', {
      title: 'Test',
      message: 'helloWorld'
    })
  }
}
