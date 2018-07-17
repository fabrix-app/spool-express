'use strict'

const FabrixApp = require('@fabrix/fabrix').FabrixApp
const pkg = require('../package')
//Allow self signed certificate
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

before(() => {
  global.app = new FabrixApp(require('./fixtures/app'))
  return global.app.start().catch(err =>  global.app.stop(err))
})

// before(done => {
//   const exVersion = process.env.EXPRESS_VERSION || pkg.devDependencies.express.replace('^', '')
//
//   global.app = new FabrixApp(require('./app'))
//   global.app.start().then(() => {
//     done()
//   }).catch(err => {
//     global.app.stop().then(() => {
//       done(err)
//     }).catch(done)
//   })
//   /*
//   npm.load({
//     loaded: false
//   }, err => {
//     if (err) return done(err)
//       // catch errors
//     npm.commands.install([`express@${exVersion}`], (err, data) => {
//       // log the error or data
//       if (err) return done(err)
//
//       global.app.start().then(() => {
//         done()
//       }).catch(err => {
//         global.app.stop().then(() => {
//           done(err)
//         }).catch(done)
//       })
//     })
//   })*/
// })

after(() => {
  return global.app.stop()
})
