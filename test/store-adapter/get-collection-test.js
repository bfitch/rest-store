import {describe,it} from 'mocha'
import {expect} from 'chai'
import storeAdapter from '../../src/plain-js-store-adapter'

describe('getCollection', function() {
  it ('throws an error if data at the path is not an array', function() {
    const adapter = storeAdapter({todos: {}});

    expect(() => adapter.getCollection('todos')).to.throw(Error,
      "getCollection() requies the path: 'todos' to be an array. Is of type: object"
    )
  })

  describe('no query argument provided', function() {
    it ('returns all data at the path', function() {
      const data = [{id: 1, a: 'a'}, {id: 2, b: 'b'}];
      const adapter = storeAdapter({todos: data});

      return adapter.getCollection('todos').then(data => {
        expect(data).to.eql(data)
      })
    })
  })

  describe('query argument provided', function() {
    describe('no data in the store', function() {
      it ('returns a promise that resolves to null', function() {
        const adapter = storeAdapter({todos: []});

        return adapter.getCollection('todos', {id: 1}).then(data => {
          expect(data).to.be.null
        })
      })
    })

    describe('data in the store', function() {
      describe('object exists with matching attributes', function() {
        it ('returns a promise that resolves to the data', function() {
          const data = [{id: 1, a: 'a'}, {id: 2, b: 'b'}];
          const adapter = storeAdapter({todos: data});

          return adapter.getCollection('todos', {id: 2}).then(data => {
            expect(data).to.eql([{id: 2, b: 'b'}]);
          })
        })
      })

      describe('objects exist with matching attributes', function() {
        it ('returns a promise that resolves to the data', function() {
          const data = [
            {id: 1, a: 'a'},
            {id: 2, b: 'b'},
            {id: 3, b: 'b'},
            {id: 4, b: 'b'},
          ];
          const adapter = storeAdapter({todos: data});

          return adapter.getCollection('todos', {b: 'b'}).then(data => {
            expect(data).to.eql([
              {id: 2, b: 'b'},
              {id: 3, b: 'b'},
              {id: 4, b: 'b'}
            ]);
          })
        })
      })

      describe('querying by multiple attributes', function() {
        it ('returns the objects with matching attributes', function() {
          const data = [
            {id: 1, a: 'a', b: 'b'},
            {id: 2, a: 'a', c: 'c'},
            {id: 3, a: 'a', b: 'b', e: 'e'}
          ];
          const adapter = storeAdapter({todos: data});

          return adapter.getCollection('todos', {a: 'a', b: 'b'}).then(data => {
            expect(data).to.eql([
              {id: 1, a: 'a', b: 'b'},
              {id: 3, a: 'a', b: 'b', e: 'e'}
            ]);
          })
        })
      })

      describe('no object exists with matching attributes', function() {
        it ('returns a promise that resolves to null', function() {
          const data    = [{id: 1, a: 'a'}, {id: 2, b: 'b'}];
          const adapter = storeAdapter({todos: data});

          return adapter.getCollection('todos', {id: 3}).then(data => {
            expect(data).to.be.null
          })
        })
      })

      describe('query attribute does not exist in any store objects', function() {
        it ('returns a promise that resolves to null', function() {
          const data    = [{id: 1, a: 'a'}, {id: 2, b: 'b'}];
          const adapter = storeAdapter({todos: data});

          return adapter.getCollection('todos', {foo: 3}).then(data => {
            expect(data).to.be.null;
          })
        })
      })
    })
  })

  describe('nested store path', function() {
    it ('returns the data at the nested path', function() {
      const adapter = storeAdapter({
        todos: {
          nested: {
            deep: [{id: 1, a: 'a'}, {id: 2, b: 'b'}]
          }
        }
      });

      return adapter.getCollection('todos.nested.deep', {id: 2}).then(data => {
        expect(data).to.eql([{id: 2, b: 'b'}]);
      })
    })
  })
})
