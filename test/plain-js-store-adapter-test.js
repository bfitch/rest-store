import {describe,it} from 'mocha'
import {expect} from 'chai'
import storeAdapter from '../src/plain-js-store-adapter'

describe('plain JS storeAdapter', function() {
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
        it ('returns a promise that resolves to null', function(done) {
          const adapter = storeAdapter({todos: []});

          adapter.get('todos', {id: 1}).then(data => {
            expect(data).to.be.null
          })
          done()
        })
      })

      describe('data in the store', function() {
        describe('object exists with matching attributes', function() {
          it ('returns a promise that resolves to the data', function(done) {
            const data = [{id: 1, a: 'a'}, {id: 2, b: 'b'}];
            const adapter = storeAdapter({todos: data});

            adapter.get('todos', {id: 2}).then(data => {
              expect(data).to.eql({id: 2, b: 'b'});
            })
            done()
          })
        })

        describe('no object exists with matching attributes', function() {
          it ('returns a promise that resolves to null', function(done) {
            const data    = [{id: 1, a: 'a'}, {id: 2, b: 'b'}];
            const adapter = storeAdapter({todos: data});

            adapter.get('todos', {id: 3}).then(data => {
              expect(data).to.be.null
            })
            done()
          })
        })

        describe('query attribute does not exist in any store objects', function() {
          it ('returns a promise that resolves to null', function(done) {
            const data    = [{id: 1, a: 'a'}, {id: 2, b: 'b'}];
            const adapter = storeAdapter({todos: data});

            adapter.get('todos', {id: 3}).then(data => {
              expect(data).to.be.null;
            })
            done()
          })
        })

        describe('store data is not an array', function() {
          it ('returns the correct object', function(done) {
            const adapter = storeAdapter({todo: {id: 1, a: 'a'}});

            adapter.get('todo', {a: 'a'}).then(data => {
              expect(data).to.eql({id: 1, a: 'a'});
            })
            done()
          })
        })

        describe('ES2015 classes', function() {
          class Todo {
            constructor(id) {
              this.id = id
            }
          }
          describe('instance has a matching property', function() {
            it ('returns the instance', function(done) {
              const data    = [new Todo(1), new Todo(2)];
              const adapter = storeAdapter({todos: data});

              adapter.get('todos', {id: 2}).then(data => {
                expect(data).to.be.an.instanceof(Todo);
                expect(data.id).to.be.eql(2);
              })
              done()
            })
          })
        })
      })
    })
  })

  describe('add', function() {
    it ('throws an error if the path is undefined', function() {
      const adapter = storeAdapter();

      expect(() => adapter.add('todos')).to.throw(Error,
        "No path: 'todos' exists in the store"
      )
    })

    describe('store data is an array', function() {
      it ('appends new data to the array', function(done) {
        const cache = {todos: [{id: 1, a: 'a'}]};
        const adapter = storeAdapter(cache);

        adapter.add('todos', {id: 2, b: 'b'}).then(data => {
          expect(data).to.eql({id: 2, b: 'b'})
        }).then(() => {
          expect(cache).to.eql({todos: [{id: 1, a: 'a'},{id: 2, b: 'b'}]})
        })
        done()
      })
    })

    describe('store data is an object/non-iterable', function() {
      it ('replaces the store data with new data', function(done) {
        const adapter = storeAdapter({todo: {id: 1, a: 'a'}});

        adapter.add('todo', {id: 2, b: 'b'}).then(data => {
          expect(data).to.eql({id: 2, b: 'b'})
        }).then(() => {
          expect(cache).to.eql({todo: {id: 2, b: 'b'}})
        })
        done()
      })
    })
  })

  describe ('replaceObject', function() {
    it ('replaces an object in the store with a new version', function(done) {
      const cache     = {todos: [{id: 1, foo: 'foo'}, {id: 5, bar: 'bar'}]};
      const adapter   = storeAdapter(cache);
      const newObject = {id: 5, woot: 'woot'};

      adapter.replaceObject('todos', newObject).then(data => {
        expect(data).to.equal(newObject);
      })
      expect(cache.todos).to.eql([{id: 1, foo: 'foo'},{id: 5, woot: 'woot'}]);
      done()
    })

    it ('adds an object to an empty store', function(done) {
      const cache     = {todos: []};
      const adapter   = storeAdapter(cache);
      const newObject = {id: 5, woot: 'woot'};

      adapter.replaceObject('todos', newObject).then(data => {
        expect(data).to.equal(newObject);
      })
      expect(cache.todos).to.eql([newObject]);
      done()
    })

    it ('adds an empty object to the store', function(done) {
      const cache     = {todos: []};
      const adapter   = storeAdapter(cache);
      const emptyObject = {};

      adapter.replaceObject('todos', emptyObject).then(data => {
        expect(data).to.equal(emptyObject);
      })
      expect(cache.todos).to.eql([emptyObject]);
      done()
    })
  })

  describe('mergeCollection', function() {
    const cached = [
      {id: 1, title: 'foo'},
      {id: 2, title: 'foo'},
      {id: 3, title: 'foo'}
    ]
    const newCollection = [
      {id: 1, title: 'big'},
      {id: 2, title: 'bigger'},
      {id: 4, title: 'biggest'}
    ]

    it ('merges the newCollection\'s objects into the cache by id', function(done) {
      const cache   = {todos: cached};
      const adapter = storeAdapter(cache);

      adapter.mergeCollection('todos', newCollection).then(data => {
        expect(data).to.eql([
          {id: 1, title: 'big'},
          {id: 2, title: 'bigger'},
          {id: 3, title: 'foo'},
          {id: 4, title: 'biggest'}
        ]);
      })
      done()
    })
  })
})
