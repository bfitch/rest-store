import { describe, it } from 'mocha'
import { expect } from 'chai'
import storeAdapter from '../../src/store-adapters/cerebral'
import Model from 'cerebral-model-immutable'

describe('CerebralStoreAdapter', function () {
  describe('updateAll', function () {
    const mappings = {todos: {}}

    it('throws an error if the path is not an array', function () {
      const adapter = storeAdapter(Model({todos: {}}), mappings)

      expect(() => adapter.updateAll('todos')).to.throw(Error,
        'Store path: todos must be an array when adding a collection.'
      )
    })

    it('throws an error if the collection being added is not an array', function () {
      const adapter = storeAdapter(Model({todos: []}), mappings)

      expect(() => adapter.updateAll('todos')).to.throw(Error,
        'updateAll() should not be used to update the store path: todos with an empty collection.'
      )
    })

    it('throws if no object in the collection has the identifier', function () {
      const adapter = storeAdapter(Model({todos: []}), mappings)

      expect(() => adapter.updateAll('todos', [{foo: 'foo'}, {boo: 'boo'}])).to.throw(Error,
        "Collection has no property: 'id'"
      )
    })

    // - If an object in the collection isn't yet in the store it will be added.
    // - If an object is already in the store, its attributes will be merged.
    // - If the store contains any objects that aren't present in the collection, they'll be removed.
    // You can disable this behavior with options: {replace: true}.
    // TODO: add options for: {add: false}, {remove: false}

    it('finds objects by id and merges new attrs into each object', function () {
      const cached = [
        {id: 1, title: 'foo'},
        {id: 2, title: 'foo'},
        {id: 3, title: 'foo'}
      ]
      const newCollection = [
        {id: 1, other: 'big baby'},
        {id: 2, title: 'bigger'},
        {id: 4, title: 'biggest'}
      ]

      const adapter = storeAdapter(Model({todos: cached}), mappings)
      const model = adapter.cache.accessors

      return adapter.updateAll('todos', newCollection).then(data => {
        expect(data).to.eql([
          {id: 1, title: 'foo', other: 'big baby'},
          {id: 2, title: 'bigger'},
          {id: 4, title: 'biggest'}
        ])
        expect(model.get('todos')).to.eql([
          {id: 1, title: 'foo', other: 'big baby'},
          {id: 2, title: 'bigger'},
          {id: 4, title: 'biggest'}
        ])
      })
    })

    it('finds objects by id and replaces them', function () {
      const cached = [
        {id: 1, foo: 'foo'},
        {id: 3, wur: 'wur'},
        {id: 5, bar: 'bar'}
      ]
      const newCollection = [
        {id: 1, boo: 'boo'},
        {id: 5, cool: 'cool'}
      ]

      const cache = {todos: cached}
      const adapter = storeAdapter(Model(cache), mappings)
      const model = adapter.cache.accessors

      return adapter.updateAll('todos', newCollection, {replace: true}).then(data => {
        expect(data).to.eql([
          {id: 1, boo: 'boo'},
          {id: 5, cool: 'cool'}
        ])
        expect(model.get('todos')).to.eql([
          {id: 1, boo: 'boo'},
          {id: 5, cool: 'cool'}
        ])
      })
    })

    describe('nested store path', function () {
      it('updates data at the nested path', function () {
        const cache = {
          todos: {
            deep: {
              nested: [
                {id: 1, title: 'foo'},
                {id: 2, title: 'foo'},
                {id: 3, title: 'foo'}
              ]
            }
          }
        }
        const newCollection = [
          {id: 1, other: 'big baby'},
          {id: 2, title: 'bigger'},
          {id: 4, title: 'biggest'}
        ]

        const adapter = storeAdapter(Model(cache), mappings)
        const model = adapter.cache.accessors

        return adapter.updateAll('todos.deep.nested', newCollection).then(data => {
          expect(data).to.eql([
            {id: 1, title: 'foo', other: 'big baby'},
            {id: 2, title: 'bigger'},
            {id: 4, title: 'biggest'}
          ])
          expect(model.get()).to.eql({
            todos: {
              deep: {
                nested: [
                  {id: 1, title: 'foo', other: 'big baby'},
                  {id: 2, title: 'bigger'},
                  {id: 4, title: 'biggest'}
                ]
              }
            }
          })
        })
      })
    })
  })
})
