import {describe,it} from 'mocha'
import {expect} from 'chai'
import storeAdapter from '../../src/plain-js-store-adapter'

describe('get', function() {
  it ('throws an error if the path is undefined', function() {
    const adapter = storeAdapter();

    expect(() => adapter.get('todos')).to.throw(Error,
      "No path: 'todos' exists in the store"
    )
  })

  describe('invalid query arguments', function() {
    describe('query object is empty', function(done) {
      it ('throws an error', function() {
        const adapter = storeAdapter({todos: []});

        expect(() => adapter.get('todos', {})).to.throw(Error,
          'You must provide a query when getting items from the store'
        )
      })
    })

    describe('no query argument provided', function() {
      it ('throws an error', function() {
        const adapter = storeAdapter({todos: []});

        expect(() => adapter.get('todos')).to.throw(Error,
          'You must provide a query when getting items from the store'
        )
      })
    })
  })

  describe('query argument provided', function() {
    describe('no data in the store', function() {
      it ('returns a promise that resolves to null', function() {
        const adapter = storeAdapter({todos: []});

        return adapter.get('todos', {id: 1}).then(data => {
          expect(data).to.be.null
        })
      })
    })

    describe('data in the store', function() {
      describe('object exists with matching attributes', function() {
        it ('returns a promise that resolves to the data', function() {
          const data = [{id: 1, a: 'a'}, {id: 2, b: 'b'}];
          const adapter = storeAdapter({todos: data});

          return adapter.get('todos', {id: 2}).then(data => {
            expect(data).to.eql({id: 2, b: 'b'});
          })
        })
      })

      describe('no object exists with matching attributes', function() {
        it ('returns a promise that resolves to null', function() {
          const data    = [{id: 1, a: 'a'}, {id: 2, b: 'b'}];
          const adapter = storeAdapter({todos: data});

          return adapter.get('todos', {id: 3}).then(data => {
            expect(data).to.be.null
          })
        })
      })

      describe('query attribute does not exist in any store objects', function() {
        it ('returns a promise that resolves to null', function() {
          const data    = [{id: 1, a: 'a'}, {id: 2, b: 'b'}];
          const adapter = storeAdapter({todos: data});

          return adapter.get('todos', {id: 3}).then(data => {
            expect(data).to.be.null;
          })
        })
      })

      describe('store data is not an array', function() {
        it ('returns the correct object', function() {
          const adapter = storeAdapter({todo: {id: 1, a: 'a'}});

          return adapter.get('todo', {a: 'a'}).then(data => {
            expect(data).to.eql({id: 1, a: 'a'});
          })
        })
      })

      describe('ES2015 classes', function() {
        class Todo {
          constructor(id) {
            this.id = id
          }
        }
        describe('instance has a matching property', function() {
          it ('returns the instance', function() {
            const data    = [new Todo(1), new Todo(2)];
            const adapter = storeAdapter({todos: data});

            return adapter.get('todos', {id: 2}).then(data => {
              expect(data).to.be.an.instanceof(Todo);
              expect(data.id).to.be.eql(2);
            })
          })
        })
      })
    })
  })
})
