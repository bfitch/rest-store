import {describe,it} from 'mocha'
import {expect} from 'chai'
import storeAdapter from '../src/plain-js-store-adapter'

describe('js storeAdapter', function() {
  describe('setById', function() {
    it ('throws an error if the path is undefined', function() {
      const adapter = storeAdapter();

      expect(() => adapter.setById('todos')).to.throw(Error,
        "No path: 'todos' exists in the store"
      )
    })

    describe('store data is an array', function() {
      it ('appends new data to the array', function() {
        const cache   = {todos: [{id: 1, a: 'a'}]};
        const adapter = storeAdapter(cache);

        return adapter.setById('todos', 2, {id: 2, b: 'b'}).then(data => {
          expect(data).to.eql({id: 2, b: 'b'})
        }).then(() => {
          expect(cache).to.eql({todos: [{id: 1, a: 'a'},{id: 2, b: 'b'}]})
        })
      })
    })

    describe('store data is an object/non-iterable', function() {
      it ('replaces the store data with new data', function() {
        const cache   = {todo: {id: 1, a: 'a'}};
        const adapter = storeAdapter(cache);

        return adapter.setById('todo', 2, {id: 2, b: 'b'}).then(data => {
          expect(data).to.eql({id: 2, b: 'b'})
        }).then(() => {
          expect(cache).to.eql({todo: {id: 2, b: 'b'}})
        })
      })
    })

    describe('updating an object', function() {
      it ('replaces an object in the store with a new version', function() {
        const cache     = {todos: [{id: 1, foo: 'foo'}, {id: 5, bar: 'bar'}]};
        const adapter   = storeAdapter(cache);
        const newObject = {id: 5, woot: 'woot'};

        return adapter.setById('todos', 5, newObject).then(data => {
          expect(data).to.equal(newObject);
        })
        expect(cache.todos).to.eql([{id: 1, foo: 'foo'},{id: 5, woot: 'woot'}]);
      })

      it ('adds an object to an empty store', function() {
        const cache     = {todos: []};
        const adapter   = storeAdapter(cache);
        const newObject = {id: 5, woot: 'woot'};

        return adapter.setById('todos', 5, newObject).then(data => {
          expect(data).to.equal(newObject);
        })
        expect(cache.todos).to.eql([newObject]);
      })

      it ('adds an empty object to the store', function() {
        const cache     = {todos: []};
        const adapter   = storeAdapter(cache);
        const emptyObject = {};

        return adapter.setById('todos', emptyObject).then(data => {
          expect(data).to.equal(emptyObject);
        })
        expect(cache.todos).to.eql([emptyObject]);
      })
    })
  })

})
