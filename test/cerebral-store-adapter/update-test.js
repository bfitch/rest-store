import { describe, it } from 'mocha'
import { expect } from 'chai'
import storeAdapter from '../../src/cerebral-store-adapter'
import Model from 'cerebral-model-baobab'

describe('CerebralStoreAdapter', function () {
  describe('update', function () {
    const mappings = {todos: {}}

    it('throws if attrs are a collection', function () {
      const cache = {todos: []}
      const adapter = storeAdapter(Model(cache), mappings)

      expect(() => adapter.update('todos', 1, [])).to.throw(Error,
        'ArgumentError: update() cannot set an array. Use updateAll() instead.'
      )
    })

    describe('store path is a collection', function () {
      it('finds the object by id and merges new attrs', function () {
        const cache = {todos: [{id: 1, foo: 'foo'}, {id: 5, bar: 'bar'}]}
        const adapter = storeAdapter(Model(cache), mappings)
        const model = adapter.cache.accessors
        const attrs = {id: 5, woot: 'woot'}

        return adapter.update('todos', 5, attrs).then(data => {
          expect(data).to.eql({id: 5, bar: 'bar', woot: 'woot'})
          expect(model.get('todos')).to.eql([
            {id: 1, foo: 'foo'},
            {id: 5, bar: 'bar', woot: 'woot'}
          ])
        })
      })

      it('finds the object by id and replaces it', function () {
        const cache = {todos: [{id: 1, foo: 'foo'}, {id: 5, bar: 'bar'}]}
        const adapter = storeAdapter(Model(cache), mappings)
        const model = adapter.cache.accessors
        const attrs = {id: 5, woot: 'woot'}

        return adapter.update('todos', 5, attrs, {replace: true}).then(data => {
          expect(data).to.eql({id: 5, woot: 'woot'})
          expect(model.get('todos')).to.eql([
            {id: 1, foo: 'foo'},
            {id: 5, woot: 'woot'}
          ])
        })
      })

      it('removes the object by id and returns it', function () {
        const cache = {todos: [{id: 1, foo: 'foo'}, {id: 5, bar: 'bar'}]}
        const adapter = storeAdapter(Model(cache), mappings)
        const model = adapter.cache.accessors

        return adapter.update('todos', 1).then(data => {
          expect(data).to.eql({id: 1, foo: 'foo'})
          expect(model.get('todos')).to.eql([{id: 5, bar: 'bar'}])
        })
      })

      describe('deleting objects', function () {
        it('throws an error if no object is found', function () {
          const cache = {todos: []}
          const adapter = storeAdapter(Model(cache), mappings)

          expect(() => adapter.update('todos', 2)).to.throw(Error,
            "No object found at path: 'todos' with 'id': 2."
          )
        })
      })
    })

    describe('store path is an object', function () {
      const mappings = {todo: []}

      it('finds the object by id and merges new attrs', function () {
        const cache = {todo: {id: 5, bar: 'bar'}}
        const adapter = storeAdapter(Model(cache), mappings)
        const model = adapter.cache.accessors
        const attrs = {id: 5, woot: 'woot'}

        return adapter.update('todo', 5, attrs).then(data => {
          expect(data).to.eql({id: 5, bar: 'bar', woot: 'woot'})
          expect(model.get('todo')).to.eql({id: 5, bar: 'bar', woot: 'woot'})
        })
      })

      it('finds the object by id and replaces it', function () {
        const cache = {todo: {id: 5, bar: 'bar'}}
        const adapter = storeAdapter(Model(cache), mappings)
        const model = adapter.cache.accessors
        const attrs = {id: 5, woot: 'woot'}

        return adapter.update('todo', 5, attrs, {replace: true}).then(data => {
          expect(data).to.eql({id: 5, woot: 'woot'})
          expect(model.get('todo')).to.eql({id: 5, woot: 'woot'})
        })
      })

      it('removes the object by id and returns it', function () {
        const cache = {todo: {id: 1, foo: 'foo'}}
        const adapter = storeAdapter(Model(cache), mappings)
        const model = adapter.cache.accessors

        return adapter.update('todo', 1).then(data => {
          expect(data).to.eql({id: 1, foo: 'foo'})
          expect(model.get('todo')).to.be.null
        })
      })
    })

    describe('nested store path', function () {
      const mappings = {todo: {}}
      const cache = {
        todo: {
          nested: {
            deep: {id: 5, bar: 'bar'}
          }
        }
      }
      const adapter = storeAdapter(Model(cache), mappings)
      const model = adapter.cache.accessors
      const attrs = {id: 5, woot: 'woot'}

      it('updates data at the nested path', function () {
        return adapter.update('todo.nested.deep', 5, attrs).then(data => {
          expect(data).to.eql({id: 5, bar: 'bar', woot: 'woot'})
          expect(model.get()).to.eql({
            todo: {
              nested: {
                deep: {id: 5, bar: 'bar', woot: 'woot'}
              }
            }
          })
        })
      })
    })
  })
})
