import {describe,it} from 'mocha';
import {expect} from 'chai';
import sinon from 'sinon';
import nock from 'nock';
import {restStore} from '../../index';
import jsStoreAdapter from '../../src/js-store-adapter';

describe('update', function() {
  const mockServer = nock('http://todos.com');
  const mappings = { todos: { url: 'http://todos.com/todos' } };

  describe('non-optimistic update', function() {
    mockServer
      .put('/todos/1', {id: 1, c: 'c'})
      .reply(200, function(uri, requestBody) {
        return {todo: JSON.parse(requestBody)}
      });

    const cache        = {todos: [{id: 1, a: 'a'}]};
    const storeAdapter = jsStoreAdapter(cache, mappings);
    const store        = restStore(mappings, storeAdapter);

    it ('returns a promise that resolves with the created data', function() {
      return store.update('todos', {id: 1}, {id: 1, c: 'c'}, {wait: true}).then(data => {
        expect(data).to.eql({id: 1, c: 'c'});
        expect(cache).to.eql({todos: [{id: 1, c: 'c'}]});
      })
    })

    describe('request fails', function() {
      mockServer
        .put('/todos/1', {id: 1, c: 'c'})
        .reply(422, {'message': 'something awful happened'});

        const cache        = {todos: [{id: 1, a: 'a'}]};
        const storeAdapter = jsStoreAdapter(cache, mappings);
        const store        = restStore(mappings, storeAdapter);

      it ('bubbles the http error to be handled by a catch callback', function() {
        return store.update('todos', {id: 1}, {id: 1, c: 'c'}, {wait: true}).catch(response => {
          expect(response.status).to.equal(422);
          expect(response.statusText).to.be.null;
          expect(response.headers).to.eql({'content-type': 'application/json'});
          expect(response.data).to.eql({'message': 'something awful happened'});

          expect(cache).to.eql({todos: [{id: 1, a: 'a'}]});
        });
      })
    })
  })

  describe ('optimistic update', function() {
    const cache        = {todos: [{id: 1, a: 'a'}]};
    const storeAdapter = jsStoreAdapter(cache, mappings);
    const store        = restStore(mappings, storeAdapter);

    it ('inserts the object into the store before PUTing to the server', function() {
      const uuid = require('node-uuid');
      sinon.collection.stub(uuid, 'v4').returns('123');
      const storeStub = sinon.collection.stub(storeAdapter, 'update').returns({then() {}});

      store.update('todos', {id: 1}, {id: 1, c: 'c'});

      expect(storeStub.calledWithExactly('todos', 1, {id: 1, c: 'c', _cid: '123'}, {replace: true})).to.be.true
      sinon.collection.restore();
    })

    describe ('server roundtrip', function() {
      mockServer
        .put('/todos/1', {a: 'a', c: 'c'})
        .reply(200, function(uri, requestBody) {
          return {todo: JSON.parse(requestBody)};
        });

      it ('POSTs to the server and replaces the cid with the response data', function() {
        return store.update('todos', {id: 1}, {id: 1, a: 'a', c: 'c'}).then(data => {
          expect(data).to.eql({id: 1, a: 'a', c: 'c'});
          expect(cache).to.eql({todos: [{id: 1, a: 'a', c: 'c'}]});
        })
      })

      describe('request fails', function() {
        mockServer
          .put('/todos/1', {c: 'c'})
          .reply(422, {'message': 'something awful happened'});

          const cache        = {todos: [{id: 1, a: 'a'}]};
          const storeAdapter = jsStoreAdapter(cache, mappings);
          const store        = restStore(mappings, storeAdapter);

        it ('bubbles the http error and rolls back the optimistic update', function() {
          return store.update('todos', {id: 1}, {id: 1, c: 'c'}).catch(response => {
            expect(response.status).to.equal(422);
            expect(response.statusText).to.be.null;
            expect(response.headers).to.eql({'content-type': 'application/json'});
            expect(response.data).to.eql({'message': 'something awful happened'});

            expect(cache.todos).to.eql([{id: 1, a: 'a'}]);
          });
        })
      })

      describe('nested store path', function() {
        mockServer
          .put('/todos/1', {a: 'a', c: 'c'})
          .reply(200, function(uri, requestBody) {
            return {todo: JSON.parse(requestBody)};
          });

        const cache = {
          todos: {
            nested: [{id: 1, a: 'a'}]
          }
        };
        const storeAdapter = jsStoreAdapter(cache, mappings);
        const store        = restStore(mappings, storeAdapter);

        it ('POSTs to the server and replaces the cid with the response data', function() {
          return store.update('todos.nested', {id: 1}, {id: 1, a: 'a', c: 'c'}).then(data => {
            expect(data).to.eql({id: 1, a: 'a', c: 'c'});
            expect(cache).to.eql({
              todos: {
                nested: [{id: 1, a: 'a', c: 'c'}]
              }
            })
          })
        })
      })
    })
  })
})
