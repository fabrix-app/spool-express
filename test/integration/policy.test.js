'use strict'

const assert = require('assert')
const supertest = require('supertest')

describe('express policies', () => {
  let request
  before(() => {
    request = supertest('http://localhost:3000')
  })
  describe('Default', () => {
    describe('success', () => {
      it('should return {app: \'3.0.0\'} on GET /default/policySuccess', (done) => {
        request
          .get('/default/policySuccess')
          .expect(200)
          .end((err, res) => {
            if (!err) {
              const data = res.body
              assert.deepEqual(data, { app: '3.0.0' })
            }
            done(err)
          })
      })
    })
    describe('fail', () => {
      it('should return an error on GET /default/policyFail', (done) => {
        request
          .get('/default/policyFail')
          .expect(500)
          .end((err, res) => {
            done(err)
          })
      })
    })
    describe('intercept', () => {
      it('should return {result: \'intercept\'} on GET /default/policyIntercept', (done) => {
        request
          .get('/default/policyIntercept')
          .expect(200)
          .end((err, res) => {
            if (!err) {
              const data = res.body
              assert.deepEqual(data, {result: 'intercept'})
            }
            done(err)
          })
      })
    })
  })
})
