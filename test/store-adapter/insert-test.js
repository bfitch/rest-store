import {describe,it} from 'mocha'
import {expect} from 'chai'
import storeAdapter from '../../src/plain-js-store-adapter'

describe('insert', function() {
  it ('throws an error if the path is undefined', function() {
    const adapter = storeAdapter();

    expect(() => adapter.insert('todos')).to.throw(Error,
      "No path: 'todos' exists in the store"
    )
  })

  describe('inserting a collection', function() {
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

    it ('throws an error if the store path is not a collection', function() {
      const adapter = storeAdapter({todos: {}});

      expect(() => adapter.insert('todos', [])).to.throw(Error,
        "Store path: todos must be an array if adding a collection."
      )
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
  })
