import {describe,it} from 'mocha';
import {expect} from 'chai';
import {restStore} from '../index';
import jsStoreAdapter from '../src/plain-js-store-adapter';
import nock from 'nock';

describe('find', function() {
  const mockServer = nock('http://todos.com');
  const mappings = { todos: { url: 'http://todos.com/todos' } };

  it ('throws an error if no store adapter is passed in', function() {
    expect(() => restStore(mappings)).to.throw(Error,
      'No storeAdapter. You must provide an in-memory store'
    )
  })

  describe('data is in the store', function() {
    const [a,b] = [{id: 1, a: 'a'}, {id: 3, c: 'c'}]
    const storeAdapter = jsStoreAdapter({todos: [a,b]}, mappings);
    const store        = restStore(mappings, storeAdapter);

    it ('returns a promise that resolves with the in-memory data', function() {
      return store.find('todos', {id: 1}).then(data => {
        expect(data).to.equal(a)
      })
    })

    describe ('force is passed as an option', function() {
      describe('request fails', function() {
        mockServer
          .get('/todos/3')
          .reply(422, {'message': 'something awful happened'});

          const cache        = {todos: []};
          const storeAdapter = jsStoreAdapter(cache, mappings);
          const store        = restStore(mappings, storeAdapter);

        it ('bubbles the http error to be handled by a catch callback', function() {
          return store.find('todos', {id: 3}, {force: true}).catch(response => {
            expect(response.status).to.equal(422);
            expect(response.statusText).to.be.null;
            expect(response.headers).to.eql({'content-type': 'application/json'});
            expect(response.data).to.eql({'message': 'something awful happened'});

            expect(cache.todos).to.be.empty;
          });
        })
      })

      describe ('object with same identifier value is in the store', function() {
        mockServer
          .get('/todos/3')
          .reply(200, {todo: {id: 3, c: 'c' }});

        const cache        = {todos: [{id: 1, a: 'a'}, {id: 3, c: 'c'}]};
        const [a,c]        = cache.todos;
        const storeAdapter = jsStoreAdapter(cache, mappings);
        const store        = restStore(mappings, storeAdapter);

        it ('makes an ajax request, returns the object, replaces it in the store', function() {
          return store.find('todos', {id: 3}, {force: true}).then(data => {
            expect(data).to.not.equal(c);
            expect(data).to.eql(c);
            expect(cache).to.eql({todos: [{id: 1, a: 'a'}, {id: 3, c: 'c'}]});
          })
        })
      })
    })
  })

  describe('data is not in the store', function() {
    describe('request fails', function() {
      mockServer
        .get('/todos/3')
        .reply(500, {'message': 'something awful happened'});

        const cache        = {todos: []};
        const storeAdapter = jsStoreAdapter(cache, mappings);
        const store        = restStore(mappings, storeAdapter);

      it ('bubbles the http error to be handled by a catch callback', function() {
        return store.find('todos', {id: 3}).catch(response => {
          expect(response.status).to.equal(500);
          expect(response.statusText).to.be.null;
          expect(response.headers).to.eql({'content-type': 'application/json'});
          expect(response.data).to.eql({'message': 'something awful happened'});

          expect(cache.todos).to.be.empty;
        });
      })
    })

    describe('successfull request', function() {
      mockServer
        .get('/todos/5')
        .reply(200, {todo: {id: 5, woot: 'woot' }});

      const cache        = {todos: [{id: 1, a: 'a'}, {id: 3, c: 'c'}]};
      const storeAdapter = jsStoreAdapter(cache);
      const store        = restStore(mappings, storeAdapter);

      it ('performs an ajax request and adds the data to the store', function() {
        return store.find('todos', {id: 5}).then(data => {
          expect(data).to.eql({id: 5, woot: 'woot' });
        })
        .then(() => {
          expect(cache).to.eql({todos: [
            {id: 1, a: 'a'},
            {id: 3, c: 'c'},
            {id: 5, woot: 'woot'}]
          });
        })
      })
    })
  })
})
