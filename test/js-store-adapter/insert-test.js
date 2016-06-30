import {describe,it} from 'mocha'
import {expect} from 'chai'
import storeAdapter from '../../src/js-store-adapter'

describe('insert', function() {
  describe('inserting a collection', function() {
    it ('throws an error if the store path is not a collection', function() {
      const adapter = storeAdapter({todos: {}});

      expect(() => adapter.insert('todos', [])).to.throw(Error,
        "Store path: todos must be an array if adding a collection."
      )
    })

    it ('adds each object in the collection to the store', function() {
      const cache   = {todos: [{id: 1, a: 'a'}]};
      const adapter = storeAdapter(cache);

      return adapter.insert('todos', [{id: 2, b: 'b'}, {id: 3, c: 'c'}]).then(data => {
        expect(data).to.eql([{id: 2, b: 'b'}, {id: 3, c: 'c'}]);
        expect(cache).to.eql({todos: [
          {id: 1, a: 'a'},
          {id: 2, b: 'b'},
          {id: 3, c: 'c'}
        ]});
      });
    })
  })

  describe('inserting an object', function() {
    it ('adds the object to the array at the path', function() {
      const cache   = {todos: [{id: 1, a: 'a'}]};
      const adapter = storeAdapter(cache);

      return adapter.insert('todos', {id: 2, b: 'b'}).then(data => {
        expect(data).to.eql({id: 2, b: 'b'});
        expect(cache).to.eql({todos: [
          {id: 1, a: 'a'},
          {id: 2, b: 'b'}
        ]});
      });
    })

    it ('replaces the object at the path with the new object', function() {
      const cache   = {todo: {id: 1, a: 'a'}};
      const adapter = storeAdapter(cache);

      return adapter.insert('todo', {id: 2, b: 'b'}).then(data => {
        expect(data).to.eql({id: 2, b: 'b'});
        expect(cache).to.eql({ todo: {id: 2, b: 'b'} });
      });
    })

    it ('adds an object to an empty store', function() {
      const cache     = {todos: []};
      const adapter   = storeAdapter(cache);
      const newObject = {id: 5, woot: 'woot'};

      return adapter.insert('todos', newObject).then(data => {
        expect(data).to.equal(newObject);
      })
      expect(cache.todos).to.eql([newObject]);
    })

    it ('adds an empty object to the store', function() {
      const cache     = {todos: []};
      const adapter   = storeAdapter(cache);
      const emptyObject = {};

      return adapter.insert('todos', emptyObject).then(data => {
        expect(data).to.equal(emptyObject);
      })
      expect(cache.todos).to.eql([emptyObject]);
    })
  })

  describe('nested store path', function() {
    it ('replaces the object at the path with the new object', function() {
      const cache = {
        todo: {
          nested: {
            deep: {id: 1, a: 'a'}
          }
        }
      };
      const adapter = storeAdapter(cache);

      return adapter.insert('todo.nested.deep', {id: 2, b: 'b'}).then(data => {
        expect(data).to.eql({id: 2, b: 'b'});
        expect(cache).to.eql({
          todo: {
            nested: {
              deep: {id: 2, b: 'b'}
            }
          }
        });
      });
    })
  })
})
