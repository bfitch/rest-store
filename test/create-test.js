import {describe,it} from 'mocha';
import {expect} from 'chai';
import sinon from 'sinon';
import {restStore} from '../index';
import jsStoreAdapter from '../src/plain-js-store-adapter';
import nock from 'nock';

describe('create', function() {
  const mockServer = nock('http://todos.com');
  const mappings = { todos: { url: 'http://todos.com/todos' } };

  it ('throws an error if no store adapter is passed in', function() {
    expect(() => restStore(mappings)).to.throw(Error,
      'No storeAdapter. You must provide an in-memory store'
    )
  })

  describe('non-optimistic update', function() {
    mockServer
      .post('/todos', {c: 'c'})
      .reply(201, function(uri, requestBody) {
        return {todo: Object.assign(
          {id: 3}, JSON.parse(requestBody)
        )}
      });

    const cache        = {todos: [{id: 1, a: 'a'}]};
    const storeAdapter = jsStoreAdapter(cache, mappings);
    const store        = restStore(mappings, storeAdapter);

    it ('returns a promise that resolves with the created data', function() {
      return store.create('todos', {c: 'c'}, {wait: true}).then(data => {
        expect(data).to.eql({id: 3, c: 'c'});
        expect(cache).to.eql({todos: [{id: 1, a: 'a'}, {id: 3, c: 'c'}]});
      })
    })

    describe('request fails', function() {
      mockServer
        .post('/todos', {c: 'c'})
        .reply(422, {'message': 'something awful happened'});

        const cache        = {todos: []};
        const storeAdapter = jsStoreAdapter(cache, mappings);
        const store        = restStore(mappings, storeAdapter);

      it ('bubbles the http error to be handled by a catch callback', function() {
        return store.create('todos', {c: 'c'}, {wait: true}).catch(response => {
          expect(response.status).to.equal(422);
          expect(response.statusText).to.be.null;
          expect(response.headers).to.eql({'content-type': 'application/json'});
          expect(response.data).to.eql({'message': 'something awful happened'});

          expect(cache.todos).to.be.empty;
        });
      })
    })
  })

  describe ('optimistic update', function() {
    const cache        = {todos: [{id: 1, a: 'a'}]};
    const storeAdapter = jsStoreAdapter(cache, mappings);
    const store        = restStore(mappings, storeAdapter);

    it ('inserts the object into the store before POSTing to the server', function() {
      const uuid = require('node-uuid');
      sinon.collection.stub(uuid, 'v4').returns('123');
      const storeStub = sinon.collection.stub(storeAdapter, 'insert').returns({then() {}});

      store.create('todos', {c: 'c'});
      expect(storeStub.calledWithExactly('todos', {_cid: '123', c: 'c'})).to.be.true
      sinon.collection.restore();
    })

    describe('server roundtrip', function() {
      mockServer
        .post('/todos', {c: 'c'})
        .reply(201, function(uri, requestBody) {
          return {todo: Object.assign(
            {id: 3}, JSON.parse(requestBody)
          )}
        });

      it ('POSTs to the server and replaces the cid with the response data', function() {
        return store.create('todos', {c: 'c'}).then(data => {
          expect(data).to.eql({id: 3, c: 'c'});
          expect(cache).to.eql({todos: [{id: 1, a: 'a'}, {id: 3, c: 'c'}]});
        })
      })

      describe('request fails', function() {
        mockServer
          .post('/todos', {c: 'c'})
          .reply(422, {'message': 'something awful happened'});

          const cache        = {todos: []};
          const storeAdapter = jsStoreAdapter(cache, mappings);
          const store        = restStore(mappings, storeAdapter);

        it ('bubbles the http error and rolls back the optimistic update', function() {
          return store.create('todos', {c: 'c'}).catch(response => {
            expect(response.status).to.equal(422);
            expect(response.statusText).to.be.null;
            expect(response.headers).to.eql({'content-type': 'application/json'});
            expect(response.data).to.eql({'message': 'something awful happened'});

            expect(cache.todos).to.be.empty;
          });
        })
      })

      describe('nested store path', function() {
        const cache = {
          todos: {
            deep: {
              nested: [{id: 1, a: 'a'}]
            }
          }
        };
        const storeAdapter = jsStoreAdapter(cache, mappings);
        const store        = restStore(mappings, storeAdapter);

        mockServer
          .post('/todos', {c: 'c'})
          .reply(201, function(uri, requestBody) {
            return {todo: Object.assign(
              {id: 3}, JSON.parse(requestBody)
            )}
          });

        it ('POSTs to the server and replaces the cid with the response data', function() {
          return store.create('todos.deep.nested', {c: 'c'}).then(data => {
            expect(data).to.eql({id: 3, c: 'c'});
            expect(cache).to.eql({
              todos: {
                deep: {
                  nested: [{id: 1, a: 'a'}, {id: 3, c: 'c'}]
                }
              }
            });
          })
        })
      })
    })
  })
})
