import {describe,it} from 'mocha';
import {expect} from 'chai';
import {restStore} from '../index';
import jsStoreAdapter from '../src/plain-js-store-adapter';
import nock from 'nock';

describe('findAll', function() {
  const mockServer = nock('http://todos.com');
  const mappings = {
    todos: {
      url: 'http://todos.com/todos'
    }
  }

  describe('data is in the store', function() {
    const [one,three,four] = [{id: 1, a: 'a'}, {id: 3, a: 'a'}, {id: 4, a: 'aa'}];
    const cache            = {todos: [one,three,four]}
    const storeAdapter     = jsStoreAdapter(cache, mappings);
    const store            = restStore(mappings, storeAdapter);

    it ('returns a promise that resolves with the in-memory data', function() {
      return store.findAll('todos', {a: 'a'}).then(data => {
        expect(data).to.eql([one,three]);
        expect(cache).to.eql({todos: [one,three,four]});
      })
    })

    describe ('force is passed as an option', function() {
      describe('request fails', function() {
        mockServer
          .get('/todos')
          .reply(422, {'message': 'something awful happened'});

          const cache        = {todos: []};
          const storeAdapter = jsStoreAdapter(cache, mappings);
          const store        = restStore(mappings, storeAdapter);

        it ('bubbles the http error to be handled by a catch callback', function() {
          return store.findAll('todos', {id: 3}, {force: true}).catch(response => {
            expect(response.status).to.equal(422);
            expect(response.statusText).to.be.null;
            expect(response.headers).to.eql({'content-type': 'application/json'});
            expect(response.data).to.eql({'message': 'something awful happened'});

            expect(cache.todos).to.be.empty;
          });
        })
      })

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
        const storeAdapter = jsStoreAdapter(cache, mappings);
        const store        = restStore(mappings, storeAdapter);

        // maybe want to do a request with query params and smart merge?
        it ('makes an ajax request, returns the collection, replaces it in the store', function() {
          return store.findAll('todos', {foo: 'aa'}, {force: true}).then(data => {
            expect(data).to.eql(response);
            expect(cache).to.eql({todos: response});
          })
        })
      })
    })
  })

  describe('data is not in the store', function() {
    describe('request fails', function() {
      mockServer
        .get('/todos')
        .reply(500, {'message': 'something awful happened'});

        const cache        = {todos: []};
        const storeAdapter = jsStoreAdapter(cache, mappings);
        const store        = restStore(mappings, storeAdapter);

      it ('bubbles the http error to be handled by a catch callback', function() {
        return store.findAll('todos', {id: 3}).catch(response => {
          expect(response.status).to.equal(500);
          expect(response.statusText).to.be.null;
          expect(response.headers).to.eql({'content-type': 'application/json'});
          expect(response.data).to.eql({'message': 'something awful happened'});

          expect(cache.todos).to.be.empty;
        });
      })
    })

    describe('successfull request', function() {
      const mappings = { todos: { url: 'http://todos.com/blah' } }
      const response = [
        {id: 1, foo: 'a'},
        {id: 2, foo: 'a'},
        {id: 3, foo: 'a'}
      ]
      mockServer
        .get('/blah')
        .reply(200, {todos: response});

      const cache        = {todos: [{id: 4, foo: 'b'}, {id: 5, foo: 'c'}]};
      const storeAdapter = jsStoreAdapter(cache, mappings);
      const store        = restStore(mappings, storeAdapter);

      it ('performs an ajax request and merges data into the store', function() {
        return store.findAll('todos', {foo: 'a'}).then(data => {
          expect(data).to.eql([
            {id: 1, foo: 'a'},
            {id: 2, foo: 'a'},
            {id: 3, foo: 'a'},
          ]);
          expect(cache).to.eql({todos: [
            {id: 1, foo: 'a'},
            {id: 2, foo: 'a'},
            {id: 3, foo: 'a'}
          ]});
        })
      })

      describe('nested store path', function() {
        mockServer
          .get('/blah')
          .reply(200, {todos: response});

        const cache = {
          todos: {
            deep: {
              nested: [{id: 4, foo: 'b'}, {id: 5, foo: 'c'}]
            }
          }
        };
        const storeAdapter = jsStoreAdapter(cache, mappings);
        const store        = restStore(mappings, storeAdapter);

        it ('performs an ajax request and merges data into the store', function() {
          return store.findAll('todos.deep.nested', {foo: 'a'}).then(data => {
            expect(data).to.eql([
              {id: 1, foo: 'a'},
              {id: 2, foo: 'a'},
              {id: 3, foo: 'a'},
            ]);
            expect(cache).to.eql({
              todos: {
                deep: {
                  nested: [
                    {id: 1, foo: 'a'},
                    {id: 2, foo: 'a'},
                    {id: 3, foo: 'a'}
                  ]
                }
              }
            });
          })
        })
      })
    })
  })
})
