import {describe,it} from 'mocha'
import {expect} from 'chai'
import storeAdapter from '../../src/plain-js-store-adapter'

describe('update', function() {
  const mappings = {todos: []};

  it ('throws an error if the path is undefined', function() {
    const adapter = storeAdapter({}, mappings);

    expect(() => adapter.update('todos')).to.throw(Error,
      "No path: 'todos' exists in the store"
    )
  })

  it ('throws if attrs are a collection', function() {
    const cache   = {todos: []};
    const adapter = storeAdapter(cache, mappings);

    expect(() => adapter.update('todos', 1, [])).to.throw(Error,
      "ArgumentError: update() cannot set an array. Use updateAll() instead."
    )
  })

  describe('store path is a collection', function() {
    it ('finds the object by id and merges new attrs', function() {
      const cache   = {todos: [{id: 1, foo: 'foo'}, {id: 5, bar: 'bar'}]};
      const adapter = storeAdapter(cache, mappings);
      const attrs   = {id: 5, woot: 'woot'};

      return adapter.update('todos', 5, attrs).then(data => {
        expect(data).to.eql({id: 5, bar: 'bar', woot: 'woot'});
        expect(cache.todos).to.eql([
          {id: 1, foo: 'foo'},
          {id: 5, bar: 'bar', woot: 'woot'}
        ]);
      })
    })

    it ('finds the object by id and replaces it', function() {
      const cache   = {todos: [{id: 1, foo: 'foo'}, {id: 5, bar: 'bar'}]};
      const adapter = storeAdapter(cache, mappings);
      const attrs   = {id: 5, woot: 'woot'};

      return adapter.update('todos', 5, attrs, {replace: true}).then(data => {
        expect(data).to.eql({id: 5, woot: 'woot'});
        expect(cache.todos).to.eql([
          {id: 1, foo: 'foo'},
          {id: 5, woot: 'woot'}
        ]);
      })
    })

    it ('removes the object by id and returns it', function() {
      const cache   = {todos: [{id: 1, foo: 'foo'}, {id: 5, bar: 'bar'}]};
      const adapter = storeAdapter(cache, mappings);

      return adapter.update('todos', 1).then(data => {
        expect(data).to.eql({id: 1, foo: 'foo'});
        expect(cache.todos).to.eql([{id: 5, bar: 'bar'}]);
      })
    })

    it ('throws an error if no object is found', function() {
      const cache   = {todos: []};
      const adapter = storeAdapter(cache, mappings);

      expect(() => adapter.update('todos', 2, {foo: 'foo'})).to.throw(Error,
        "No object found with 'id': 2."
      )
    })
  })

  describe('store path is an object', function() {
    const mappings = {todo: []};

    it ('finds the object by id and merges new attrs', function() {
      const cache   = {todo: {id: 5, bar: 'bar'}};
      const adapter = storeAdapter(cache, mappings);
      const attrs   = {id: 5, woot: 'woot'};

      return adapter.update('todo', 5, attrs).then(data => {
        expect(data).to.eql({id: 5, bar: 'bar', woot: 'woot'});
        expect(cache.todo).to.eql({id: 5, bar: 'bar', woot: 'woot'});
      })
    })

    it ('finds the object by id and replaces it', function() {
      const cache   = {todo: {id: 5, bar: 'bar'}};
      const adapter = storeAdapter(cache, mappings);
      const attrs   = {id: 5, woot: 'woot'};

      return adapter.update('todo', 5, attrs, {replace: true}).then(data => {
        expect(data).to.eql({id: 5, woot: 'woot'});
        expect(cache.todo).to.eql({id: 5, woot: 'woot'});
      })
    })

    it ('removes the object by id and returns it', function() {
      const cache   = {todo: {id: 1, foo: 'foo'}};
      const adapter = storeAdapter(cache, mappings);

      return adapter.update('todo', 1).then(data => {
        expect(data).to.eql({id: 1, foo: 'foo'});
        expect(cache.todo).to.be.null;
      })
    })
  })
