import {describe,it} from 'mocha';
import {expect} from 'chai';
import RESTstore from '../index';
import jsStoreAdapter from '../src/plain-js-store-adapter';
import nock from 'nock';

describe('RESTstore Integration Tests', function() {
  const mockServer = nock('http://todos.com');

  describe('find', function() {
    const mappings = {
      todos: {
        url: 'http://todos.com/todos'
      }
    }

    it ('throws an error if no store adapter is passed in', function() {
      expect(() => RESTstore(mappings)).to.throw(Error,
        'No storeAdapter. You must provide an in-memory store'
      )
    })

    describe('data is in the store', function() {
      const [a,b] = [{id: 1, a: 'a'}, {id: 3, c: 'c'}]
      const storeAdapter = jsStoreAdapter({todos: [a,b]})
      const store        = RESTstore(mappings, storeAdapter)

      it ('returns a promise that resolves with the in-memory data', function(done) {
        store.find('todos', {id: 1}).then(data => {
          expect(data).to.equal(a)
        })
        done()
      })

      describe ('force is passed as an option', function() {
        describe ('object with same identifier value is in the store', function() {
          mockServer
            .get('/todos/3')
            .reply(200, {todo: {id: 3, c: 'c' }});

          const cache        = {todos: [{id: 1, a: 'a'}, {id: 3, c: 'c'}]};
          const [a,c]        = cache.todos;
          const storeAdapter = jsStoreAdapter(cache)
          const store        = RESTstore(mappings, storeAdapter)

          it ('makes an ajax request, returns the object, replaces it in the store', function(done) {
            store.find('todos', {id: 3}, {force: true}).then(data => {
              expect(data).to.not.equal(c);
              expect(data).to.eql(c);
            })
            expect(cache).to.eql({todos: [{id: 1, a: 'a'}, {id: 3, c: 'c'}]});
            done()
          })
        })
      })
    })

    describe('data is not in the store', function() {
        mockServer
          .get('/todos/5')
          .reply(200, {todo: {id: 5, woot: 'woot' }});

        const cache        = {todos: [{id: 1, a: 'a'}, {id: 3, c: 'c'}]};
        const storeAdapter = jsStoreAdapter(cache)
        const store        = RESTstore(mappings, storeAdapter)

      it ('performs an ajax request and adds the data to the store', function(done) {
        store.find('todos', {id: 5}).then(data => {
          expect(data).to.eql({id: 5, woot: 'woot' });
        })
        .then(() => {
          expect(cache).to.eql({todos: [
            {id: 1, a: 'a'},
            {id: 3, c: 'c'},
            {id: 5, woot: 'woot'}]
          });
        })
        done()
      })
    })
  })

  // describe('findAll', function() {
  //   const mappings = {
  //     todos: {
  //       url: 'http://todos.com/todos'
  //     }
  //   }
  //
  //   describe('data is in the store', function() {
  //     const [a,b] = [{id: 1, a: 'a'}, {id: 3, c: 'c'}]
  //     const storeAdapter = jsStoreAdapter({todos: [a,b]})
  //     const store        = RESTstore(mappings, storeAdapter)
  //
  //     it ('returns a promise that resolves with the in-memory data', function(done) {
  //       store.find('todos', {id: 1}).then(data => {
  //         expect(data).to.equal(a)
  //       })
  //       done()
  //     })
  //
  //     describe ('force is passed as an option', function() {
  //       describe ('objects with same value are in the store', function() {
  //         const response = [
  //           {id: 1, c: 'c' },
  //           {id: 2, c: 'c'},
  //           {id: 3, c: 'd'}
  //         ]
  //         mockServer
  //           .get('/todos')
  //           .reply(200, {todos: response});
  //
  //         const cache        = {todos: [{id: 1, a: 'a'}, {id: 2, c: 'c'}]};
  //         const [a,c]        = cache.todos;
  //         const storeAdapter = jsStoreAdapter(cache)
  //         const store        = RESTstore(mappings, storeAdapter)
  //
  //         it ('makes an ajax request, returns the object, replaces it in the store', function(done) {
  //           store.findAll('todos',
  //             {id: 3},
  //             {force: true, params: {c: 'c'} }
  //           ).then(data => {
  //             expect(data).to.not.equal(c);
  //             expect(data).to.eql(c);
  //           });
  //
  //           expect(cache).to.eql({todos: response});
  //           done()
  //         })
  //       })
  //     })
  //   })
  //
  //
  // })
})
