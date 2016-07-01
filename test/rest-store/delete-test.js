import { describe, it, afterEach } from 'mocha'
import { expect } from 'chai'
import sinon from 'sinon'
import nock from 'nock'
import { restStore } from '../../index'
import jsStoreAdapter from '../../src/js-store-adapter'
import axiosAdapter from '../../src/axios-adapter'

describe('delete', function () {
  const mockServer = nock('http://todos.com')
  const mappings = { todos: { url: 'http://todos.com/todos' } }

  describe('no data to delete in the store', function () {
    const cache = {todos: []}
    const storeAdapter = jsStoreAdapter(cache, mappings)
    const store = restStore(mappings, storeAdapter)

    it('throws an error indicating there is nothing to delete', function () {
      return store.delete('todos', {id: 1}).catch(error => {
        expect(error.message).to.eql('No data to delete at path: todos with query: {"id":1}')
        expect(cache.todos).to.be.empty
      })
    })
  })

  describe('non-optimistic update', function () {
    mockServer
      .delete('/todos/1')
      .reply(200, function (uri, requestBody) {
        return {todo: JSON.parse(requestBody)}
      })

    const cache = {todos: [{id: 1, a: 'a'}]}
    const storeAdapter = jsStoreAdapter(cache, mappings)
    const store = restStore(mappings, storeAdapter)

    it('returns a promise that resolves with the deleted data and removes it from the store', function () {
      return store.delete('todos', {id: 1}, {wait: true}).then(data => {
        expect(data).to.eql({id: 1, a: 'a'})
        expect(cache.todos).to.be.empty
      })
    })

    describe('request fails', function () {
      mockServer
        .delete('/todos/1', {id: 1, a: 'a'})
        .reply(422, {'message': 'something awful happened'})

      const cache = {todos: [{id: 1, a: 'a'}]}
      const storeAdapter = jsStoreAdapter(cache, mappings)
      const store = restStore(mappings, storeAdapter)

      it('bubbles the http error to be handled by a catch callback', function () {
        return store.delete('todos', {id: 1}, {wait: true}).catch(response => {
          expect(response.status).to.equal(422)
          expect(response.statusText).to.be.null
          expect(response.headers).to.eql({'content-type': 'application/json'})
          expect(response.data).to.eql({'message': 'something awful happened'})

          expect(cache).to.eql({todos: [{id: 1, a: 'a'}]})
        })
      })
    })
  })

  describe('optimistic update', function () {
    afterEach(function () {
      sinon.collection.restore()
    })

    const cache = {todos: [{id: 1, a: 'a'}]}
    const storeAdapter = jsStoreAdapter(cache, mappings)
    const ajaxAdapter = axiosAdapter()
    const store = restStore(mappings, storeAdapter, ajaxAdapter)

    it('deletes the object from the store before sending a DELETE to the server', function () {
      const storeSpy = sinon.collection.spy(storeAdapter, 'update').withArgs('todos', 1)
      const ajaxStub = sinon.collection.stub(ajaxAdapter, 'delete')
        .withArgs('http://todos.com/todos/1', { id: 1, a: 'a' }, {}, {})
        .returns({ then () { return { catch: function () {} } } })

      return store.delete('todos', {id: 1}).then(() => {
        expect(storeSpy.calledOnce).to.be.true
        expect(ajaxStub.calledOnce).to.be.true
        expect(storeSpy.calledBefore(ajaxStub)).to.be.true
      })
    })

    describe('server roundtrip', function () {
      mockServer
        .delete('/todos/1')
        .reply(200, function (uri, requestBody) {
          return {todo: JSON.parse(requestBody)}
        })

      const cache = {todos: [{id: 1, a: 'a'}]}
      const storeAdapter = jsStoreAdapter(cache, mappings)
      const store = restStore(mappings, storeAdapter)

      it('removes the object from the store and sends a DELETE to the server', function () {
        return store.delete('todos', {id: 1}).then(data => {
          expect(data).to.eql({id: 1, a: 'a'})
          expect(cache.todos).to.be.empty
        })
      })

      describe('request fails', function () {
        mockServer
          .delete('/todos/1')
          .reply(422, {'message': 'something awful happened'})

        const cache = {todos: [{id: 1, a: 'a'}]}
        const storeAdapter = jsStoreAdapter(cache, mappings)
        const store = restStore(mappings, storeAdapter)

        it('bubbles the http error and rolls back the optimistic delete', function () {
          return store.delete('todos', {id: 1}).catch(response => {
            expect(response.status).to.equal(422)
            expect(response.statusText).to.be.null
            expect(response.headers).to.eql({'content-type': 'application/json'})
            expect(response.data).to.eql({'message': 'something awful happened'})

            expect(cache.todos).to.eql([{id: 1, a: 'a'}])
          })
        })
      })

      describe('nested store path', function () {
        mockServer
          .delete('/todos/1')
          .reply(200, function (uri, requestBody) {
            return {todo: JSON.parse(requestBody)}
          })

        const cache = {
          todos: {
            deep: {
              nested: {
                path: [{id: 1, a: 'a'}]
              }
            }
          }
        }
        const storeAdapter = jsStoreAdapter(cache, mappings)
        const store = restStore(mappings, storeAdapter)

        it('removes the object from the store and sends a DELETE to the server', function () {
          return store.delete('todos.deep.nested.path', {id: 1}).then(data => {
            expect(data).to.eql({id: 1, a: 'a'})
            expect(cache.todos.deep.nested.path).to.be.empty
          })
        })
      })
    })
  })
})
