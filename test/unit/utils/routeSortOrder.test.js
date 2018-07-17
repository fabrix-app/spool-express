'use strict'
/* global describe, it */
const assert = require('assert')
const sort = require('@fabrix/spool-router').Utils.sortRoutes

describe('Utils Route Sort Order', () => {
  it('should exist', () => {
    assert(sort)
  })
  it('should sort the routes for express', () => {
    let routes = {
      '/a': {},
      '/a/:id': {},
      '/a/*': {},
      '/b': {},
      '/a/:id/:world': {},
      '/a/:id/*': {},
      '*': {},
      '/b/:id/:world': {},
      '/': {},
      '/b/:id/*': {},
      '/b/:id': {},
      '/b/*': {}
    }

    routes = sort(routes, {order: 'asc'})

    assert.deepEqual(routes, {
      '/a': {},
      '/a/:id': {},
      '/a/*': {},
      '/a/:id/:world': {},
      '/a/:id/*': {},
      '/b': {},
      '/b/:id': {},
      '/b/*': {},
      '/b/:id/:world': {},
      '/b/:id/*': {},
      '/': {},
      '*': {}
    })
  })

  it('should sort the routes for free variables', () => {
    let routes = {
      '/a': {},
      '/a/{id}': {},
      '/a/*': {},
      '/b': {},
      '/a/{id}/{world}': {},
      '/a/{id}/*': {},
      '*': {},
      '/b/{id}/{world}': {},
      '/': {},
      '/b/{id}/*': {},
      '/b/{id}': {},
      '/b/*': {},
    }

    routes = sort(routes, 'asc')

    assert.deepEqual(routes, {
      '/a': {},
      '/a/{id}': {},
      '/a/*': {},
      '/a/{id}/{world}': {},
      '/a/{id}/*': {},
      '/b': {},
      '/b/{id}': {},
      '/b/*': {},
      '/b/{id}/{world}': {},
      '/b/{id}/*': {},
      '/': {},
      '*': {},
    })
  })
})
