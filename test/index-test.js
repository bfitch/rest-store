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
              expect(cache).to.eql({todos: [{id: 1, a: 'a'}, {id: 3, c: 'c'}]});
              done()
            })
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
          done()
        })
      })
    })
  })

  describe('findAll', function() {
    const mappings = {
      todos: {
        url: 'http://todos.com/todos'
      }
    }

    describe('data is in the store', function() {
      const [one,three,four] = [{id: 1, a: 'a'}, {id: 3, a: 'a'}, {id: 4, a: 'aa'}];
      const storeAdapter = jsStoreAdapter({todos: [one,three,four]});
      const store        = RESTstore(mappings, storeAdapter);

      it ('returns a promise that resolves with the in-memory data', function(done) {
        store.findAll('todos', {a: 'a'}).then(data => {
          expect(data).to.eql([one,three]);
          done()
        })
      })

      describe ('force is passed as an option', function() {
        describe ('objects with same value are in the store', function() {
          const response = [
            {id: 1, foo: 'a' },
            {id: 2, foo: 'b'},
            {id: 3, bar: 'd'}
          ]
          mockServer
            .get('/todos')
            .reply(200, {todos: response});

          const cache        = {todos: [{id: 1, foo: 'aa'}, {id: 2, foo: 'aa'}]};
          const storeAdapter = jsStoreAdapter(cache);
          const store        = RESTstore(mappings, storeAdapter)

          // maybe want to do a request with query params and smart merge?
          it ('makes an ajax request, returns the collection, replaces it in the store', function(done) {
            store.findAll('todos', {foo: 'aa'}, {force: true}).then(data => {
              expect(data).to.eql(response);
              expect(cache).to.eql({todos: response});
              done()
            })
            .catch(error => { console.log(error) });
          })
        })
      })
    })

    describe('data is not in the store', function() {
      const mappings = {
        todos: {
          url: 'http://todos.com/blah'
        }
      }
      const response = [
        {id: 1, foo: 'a' },
        {id: 2, foo: 'a'},
        {id: 3, foo: 'a'}
      ]
      mockServer
        .get('/blah')
        .reply(200, {todos: response});

      const cache        = {todos: [{id: 4, foo: 'b'}, {id: 5, foo: 'c'}]};
      const storeAdapter = jsStoreAdapter(cache)
      const store        = RESTstore(mappings, storeAdapter)

      it ('performs an ajax request and merges data into the store', function(done) {
        store.findAll('todos', {foo: 'a'}).then(data => {
          expect(data).to.eql([
            {id: 1, foo: 'a'},
            {id: 2, foo: 'a'},
            {id: 3, foo: 'a'},
          ]);
          expect(cache).to.eql({todos: [
            {id: 1, foo: 'a'},
            {id: 2, foo: 'a'},
            {id: 3, foo: 'a'},
            {id: 4, foo: 'b'},
            {id: 5, foo: 'c'}
          ]});
          done()
        })
        .catch(error => { console.log(error) });
      })
    })
  })
})
