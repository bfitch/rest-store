import {describe,it} from 'mocha'
import {expect} from 'chai'
import storeAdapter from '../../src/plain-js-store-adapter'

describe('updateAll', function() {
  const mappings = {todos: []};

  it ('throws an error if the path is undefined', function() {
    const adapter = storeAdapter({}, mappings);

    expect(() => adapter.updateAll('todos')).to.throw(Error,
      "No path: 'todos' exists in the store"
    )
  })

  it ('throws an error if the path is not an array', function() {
    const adapter = storeAdapter({todos: {}}, {todos: {}});

    expect(() => adapter.updateAll('todos')).to.throw(Error,
      "Store path: todos must be an array when adding a collection."
    )
  })

  it ('throws an error if the collection being added is not an array', function() {
    const adapter = storeAdapter({todos: []}, {todos: {}});

    expect(() => adapter.updateAll('todos')).to.throw(Error,
      "updateAll() should not be used to update the store path: todos with an empty collection."
    )
  })

  it ('throws if no object in the collection has the identifier', function() {
    const adapter = storeAdapter({todos: []}, {todos: {}});

    expect(() => adapter.updateAll('todos', [{foo: 'foo'}, {boo: 'boo'}])).to.throw(Error,
      "Collection has no property: 'id'"
    )
  })

  // If a model in the list isn't yet in the collection it will be added;
  // if the model is already in the collection its attributes will be merged;
  // and if the collection contains any models that aren't present in the list, they'll be removed.
  // options: if you'd like to customize the behavior,
  // you can disable it with options: {add: false}, {remove: false}, or {replace: true}.

  it ('finds objects by id and merges new attrs into each object', function() {
    const cached = [
      {id: 1, title: 'foo'},
      {id: 2, title: 'foo'},
      {id: 3, title: 'foo'}
    ]
    const cache = {todos: cached};
    const newCollection = [
      {id: 1, other: 'big baby'},
      {id: 2, title: 'bigger'},
      {id: 4, title: 'biggest'}
    ]

    const adapter = storeAdapter({todos: cached}, mappings);

    return adapter.updateAll('todos', newCollection).then(data => {
      expect(data).to.eql([
        {id: 1, title: 'foo', other: 'big baby'},
        {id: 2, title: 'bigger'},
        {id: 4, title: 'biggest'}
      ]);
      expect(cache.todos).to.eql([
        {id: 1, title: 'foo', other: 'big baby'},
        {id: 2, title: 'bigger'},
        {id: 4, title: 'biggest'}
      ]);
    })
  })

  it ('finds objects by id and replaces them', function() {
    const cached = [
      {id: 1, foo: 'foo'},
      {id : 3, wur: 'wur'},
      {id: 5, bar: 'bar'}
    ]
    const cache = {todos: cached};
    const adapter = storeAdapter(cache, mappings);
    const newCollection = [
      {id: 1, boo: 'boo'},
      {id: 5, cool: 'cool'}
    ];

    return adapter.updateAll('todos', newCollection, {replace: true}).then(data => {
      expect(data).to.eql([
        {id: 1, boo: 'boo'},
        {id: 5, cool: 'cool'}
      ]);
      expect(cache.todos).to.eql([
        {id: 1, boo: 'boo'},
        {id: 5, cool: 'cool'}
      ]);
    })
  })
})
