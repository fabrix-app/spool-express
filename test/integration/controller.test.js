'use strict'

const assert = require('assert')
const supertest = require('supertest')
const _ = require('lodash')

describe('express controllers', () => {
  let request
  before(() => {
    request = supertest('http://localhost:3000')
  })
  describe('DefaultController', () => {
    describe('info', () => {
      it('should return 404 on GET /default', (done) => {
        request
          .get('/default')
          .expect(404)
          .end((err, res) => {
            done(err)
          })
      })
      it('should return {app: \'1.0.0\'} on GET /default/info', (done) => {
        request
          .get('/default/info')
          .expect(200)
          .end((err, res) => {
            console.log(err)
            const data = res.body
            assert.deepEqual(data, {
              app: '1.0.0'
            })
            done(err)
          })
      })
      it('should return {test: \'ok\'} POST on /default/info', (done) => {
        request
          .post('/default/info')
          .send({
            test: 'ok'
          })
          .expect(200)
          .end((err, res) => {
            if (!err) {
              const data = res.body
              assert.deepEqual(data, {
                test: 'ok'
              })
            }
            done(err)
          })
      })
    })
    it('should get pagination', (done) => {
      request
        .get('/paginate')
        .expect(200)
        .end((err, res) => {
          assert.ok(res.headers['x-pagination-total'])
          assert.ok(res.headers['x-pagination-pages'])
          assert.ok(res.headers['x-pagination-page'])
          assert.ok(res.headers['x-pagination-limit'])
          assert.ok(res.headers['x-pagination-offset'])

          assert.equal(_.isNumber(parseInt(res.headers['x-pagination-total'])), true)
          assert.equal(_.isNumber(parseInt(res.headers['x-pagination-offset'])), true)
          assert.equal(_.isNumber(parseInt(res.headers['x-pagination-limit'])), true)
          assert.equal(_.isNumber(parseInt(res.headers['x-pagination-page'])), true)
          assert.equal(_.isNumber(parseInt(res.headers['x-pagination-pages'])), true)
          assert.ok(res.body)
          done(err)
        })
    })
    it('should do jsonCriteria', (done) => {
      request
        .get('/jsonCriteria')
        .query({ where: {hello: 'world'}})
        .expect(200)
        .end((err, res) => {
          assert.ok(res.body)
          assert.deepEqual(res.body, { hello: 'world' })
          done(err)
        })
    })

    it('should test order', (done) => {
      request
        .get('/test/world')
        .query({ where: {hello: 'world'}})
        .expect(200)
        .end((err, res) => {
          assert.ok(res.body)
          assert.deepEqual(res.body, { world: { hello: 'world' } })
          done(err)
        })
    })
    // TODO fix spool-router and come back to this
    it('should test order', (done) => {
      request
        .get('/test/earth')
        .query({ where: {hello: 'world'}})
        .expect(200)
        .end((err, res) => {
          assert.ok(res.body)
          assert.deepEqual(res.body, { world: { hello: 'world' } })
          done(err)
        })
    })
    it('should test order', (done) => {
      request
        .get('/test/mars')
        .query({ where: {hello: 'mars'}})
        .expect(200)
        .end((err, res) => {
          assert.ok(res.body)
          assert.deepEqual(res.body, {mars: { hello: 'mars' } })
          done(err)
        })
    })
  })
  describe('ViewController', () => {
    describe('helloWorld', () => {
      it('should return html on GET /', (done) => {
        request
          .get('/')
          .expect(200)
          .end((err, res) => {
            if (!err) {
              const data = res.text
              assert.deepEqual(data, '<!DOCTYPE html><html lang="en"><head><title>Test</title></head><body><h1>helloWorld</h1></body></html>')
            }
            done(err)
          })
      })
    })
  })
  describe('StandardController', () => {
    it.skip('should return {app: \'1.0.0\'} on GET /standard/info', (done) => {
      request
        .get('/standard/info')
        .expect(200)
        .end((err, res) => {
          if (!err) {
            const data = res.body
            assert.deepEqual(data, {
              app: '1.0.0'
            })
          }
          done(err)
        })
    })
    it.skip('should be intercept by policy and return 412 on GET /standard/intercept', (done) => {
      request
        .get('/standard/intercept')
        .expect(412)
        .end((err, res) => {
          if (!err) {
            assert.equal(res.status, 412)
          }
          done(err)
        })
    })
  })
})
