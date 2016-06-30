import {describe,it} from 'mocha'
import {expect} from 'chai'
import storeAdapter from '../../src/cerebral-store-adapter'
import Model from 'cerebral-model-baobab';

describe('CerebralStoreAdapter', function() {
  describe('insert', function() {
    describe('inserting a collection', function() {
      it ('throws an error if the store path is not a collection', function() {
        const adapter = storeAdapter(Model({todos: {}}));

        expect(() => adapter.insert('todos', [])).to.throw(Error,
          "Store path: todos must be an array if adding a collection."
        )
      })

      it ('adds each object in the collection to the store', function() {
        const cache   = {todos: [{id: 1, a: 'a'}]};
        const adapter = storeAdapter(Model(cache));
        const model   = adapter.cache.accessors;

        return adapter.insert('todos', [{id: 2, b: 'b'}, {id: 3, c: 'c'}]).then(data => {
          expect(data).to.eql([{id: 2, b: 'b'}, {id: 3, c: 'c'}]);
          expect(model.get()).to.eql({todos: [
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
        const adapter = storeAdapter(Model(cache));
        const model   = adapter.cache.accessors;

        return adapter.insert('todos', {id: 2, b: 'b'}).then(data => {
          expect(data).to.eql({id: 2, b: 'b'});
          expect(model.get()).to.eql({todos: [
            {id: 1, a: 'a'},
            {id: 2, b: 'b'}
          ]});
        });
      })

      it ('replaces the object at the path with the new object', function() {
        const cache   = {todo: {id: 1, a: 'a'}};
        const adapter = storeAdapter(Model(cache));
        const model   = adapter.cache.accessors;

        return adapter.insert('todo', {id: 2, b: 'b'}).then(data => {
          expect(data).to.eql({id: 2, b: 'b'});
          expect(model.get()).to.eql({ todo: {id: 2, b: 'b'} });
        });
      })

      it ('adds an object to an empty store', function() {
        const cache     = {todos: []};
        const adapter   = storeAdapter(Model(cache));
        const model     = adapter.cache.accessors;
        const newObject = {id: 5, woot: 'woot'};

        return adapter.insert('todos', newObject).then(data => {
          expect(data).to.equal(newObject);
        })
        expect(model.get('todos')).to.eql([newObject]);
      })

      it ('adds an empty object to the store', function() {
        const cache       = {todos: []};
        const adapter     = storeAdapter(Model(cache));
        const model       = adapter.cache.accessors;
        const emptyObject = {};

        return adapter.insert('todos', emptyObject).then(data => {
          expect(data).to.equal(emptyObject);
        })
        expect(model.get('todos')).to.eql([emptyObject]);
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
        const adapter = storeAdapter(Model(cache));
        const model   = adapter.cache.accessors;

        return adapter.insert('todo.nested.deep', {id: 2, b: 'b'}).then(data => {
          expect(data).to.eql({id: 2, b: 'b'});
          expect(model.get()).to.eql({
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
})
