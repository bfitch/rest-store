import {describe,it} from 'mocha';
import {expect} from 'chai';
import RESTstore from '../index';
import jsStoreAdapter from '../src/plain-js-store-adapter';
import nock from 'nock';
// import runServer from './support/mock-server';

describe('RESTstore Integration Tests', function() {
  const mockServer = nock('http://todos.com');

  describe('find', function() {
    const mappings = {
      todos: {
        url: 'http://todos.com/todos'
      }
    }

    it ('throws an error if no store adapter is passed in', function() {
      expect(() => RESTstore(mappings)).to.throw(Error,
        'No storeAdapter. You must provide an in-memory store'
      )
    })

    describe('data is in the store', function() {
      const [a,b] = [{id: 1, a: 'a'}, {id: 3, c: 'c'}]
      const storeAdapter = jsStoreAdapter({todos: [a,b]})
      const store        = RESTstore(mappings, storeAdapter)

      it ('returns a promise that resolves with the in-memory data', function(done) {
        store.find('todos', {id: 1}).then(data => {
          expect(data).to.equal(a)
          done()
        })
      })

      describe ('force is passed as an option', function() {
        describe ('object with same identifier value is in the store', function() {
          mockServer
            .get('/todos/3')
            .reply(200, {todo: {id: 3, c: 'c' }});

          const [a,b]        = [{id: 1, a: 'a'}, {id: 3, c: 'c'}]
          const storeAdapter = jsStoreAdapter({todos: [a,b]})
          const store        = RESTstore(mappings, storeAdapter)

          it ('performs an ajax request and replaces the in-memory object', function(done) {
            store.find('todos', {id: 3}, {force: true}).then(data => {
              expect(data).to.not.equal(b);
              expect(data).to.eql(b);
              done()
            })
          })
        })
      })
    })

    describe('data is not in the store', function() {
      // it ('performs an ajax request and adds the data to the store', function(done) {
      //
      // })
    })
  })
})
