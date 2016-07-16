import { describe, it } from 'mocha'
import { expect } from 'chai'
import storeAdapter from '../../src/cerebral-store-adapter'
import Model from 'cerebral-model-baobab'

describe('CerebralStoreAdapter', function () {
  describe('get', function () {
    describe('invalid query arguments', function () {
      describe('query object is empty', function (done) {
        it('throws an error', function () {
          const adapter = storeAdapter(Model({todos: []}))

          expect(() => adapter.get('todos', {})).to.throw(Error,
            'You must provide a query when getting items from the store'
          )
        })
      })

      describe('no query argument provided', function () {
        it('throws an error', function () {
          const adapter = storeAdapter(Model({todos: []}))

          expect(() => adapter.get('todos')).to.throw(Error,
            'You must provide a query when getting items from the store'
          )
        })
      })
    })

    describe('query argument provided', function () {
      describe('no data in the store', function () {
        it('returns a promise that resolves to null', function () {
          const adapter = storeAdapter(Model({todos: []}))

          return adapter.get('todos', {id: 1}).then(data => {
            expect(data).to.be.null
          })
        })
      })

      describe('data in the store', function () {
        describe('object exists with matching attributes', function () {
          it('returns a promise that resolves to the data', function () {
            const data = [{id: 1, a: 'a'}, {id: 2, b: 'b'}]
            const adapter = storeAdapter(Model({todos: data}))

            return adapter.get('todos', {id: 2}).then(data => {
              expect(data).to.eql({id: 2, b: 'b'})
            })
          })
        })

        describe('querying by multiple attributes', function () {
          it('returns the object with matching attributes', function () {
            const data = [{id: 1, a: 'a', b: 'b'}, {id: 2, a: 'a', c: 'c'}]
            const adapter = storeAdapter(Model({todos: data}))

            return adapter.get('todos', {a: 'a', b: 'b'}).then(data => {
              expect(data).to.eql({id: 1, a: 'a', b: 'b'})
            })
          })

          describe('store data is not an array', function () {
            it('returns the correct object', function () {
              const adapter = storeAdapter(Model({todo: {id: 1, a: 'a', b: 'b'}}))

              return adapter.get('todo', {a: 'a', b: 'bb'}).then(data => {
                expect(data).to.be.null
              })
            })
          })
        })

        describe('no object exists with matching attributes', function () {
          it('returns a promise that resolves to null', function () {
            const data = [{id: 1, a: 'a'}, {id: 2, b: 'b'}]
            const adapter = storeAdapter(Model({todos: data}))

            return adapter.get('todos', {id: 3}).then(data => {
              expect(data).to.be.null
            })
          })
        })

        describe('query attribute does not exist in any store objects', function () {
          it('returns a promise that resolves to null', function () {
            const data = [{id: 1, a: 'a'}, {id: 2, b: 'b'}]
            const adapter = storeAdapter(Model({todos: data}))

            return adapter.get('todos', {foo: 3}).then(data => {
              expect(data).to.be.null
            })
          })
        })

        describe('store data is not an array', function () {
          it('returns the correct object', function () {
            const adapter = storeAdapter(Model({todo: {id: 1, a: 'a'}}))

            return adapter.get('todo', {a: 'a'}).then(data => {
              expect(data).to.eql({id: 1, a: 'a'})
            })
          })
        })

        describe('nested store path', function () {
          it('returns the data at the nested path', function () {
            const adapter = storeAdapter(Model({
              todo: {
                nested: {
                  deep: {id: 1, a: 'a'}
                }
              }
            }))

            return adapter.get('todo.nested.deep', {id: 1}).then(data => {
              expect(data).to.eql({id: 1, a: 'a'})
            })
          })
        })

        describe('ES2015 classes', function () {
          class Todo {
            constructor (id) {
              this.id = id
            }
          }
          describe('instance has a matching property', function () {
            it('returns the instance', function () {
              const data = [new Todo(1), new Todo(2)]
              const adapter = storeAdapter(Model({todos: data}))

              return adapter.get('todos', {id: 2}).then(data => {
                expect(data).to.be.an.instanceof(Todo)
                expect(data.id).to.be.eql(2)
              })
            })
          })
        })
      })
    })
  })
})
