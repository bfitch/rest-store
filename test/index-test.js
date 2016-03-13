import {describe,it} from 'mocha';
import {expect} from 'chai';
import RESTstore from '../index';
import jsStoreAdapter from '../src/plain-js-store-adapter';

describe('RESTstore Integration Tests', function() {
  describe('find', function() {
    const mappings = {
      todos: {
        url: 'http://todos.com/todos'
      }
    }

    describe('data is in the store', function() {
      const storeAdapter =  jsStoreAdapter({todos: [{id: 1, a: 'a'}, {id: 3, c: 'c'}]})
      const store = RESTstore(mappings)

      it.only ('returns a promise that resolves with the in-memory data', function(done) {
        store.find('todos', {id: 1}).then(data => {
          expect(data).to.eql({id: 1, a: 'a'})
          done()
        })
      })

      describe ('force is passed as an option', function() {
        // it ('forces an ajax request', function(done) {
        //
        // })
      })
    })
    describe('data is not in the store', function() {
      // it ('performs an ajax request to get the data', function(done) {
      //
      // })
    })
  })
})
