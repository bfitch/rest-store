import {describe,it} from 'mocha'
import {expect} from 'chai'
import storeAdapter from '../../src/plain-js-store-adapter'

describe('updateAll', function() {
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

  it ('merges the newCollection\'s objects into the store by id', function() {
    const cache   = {todos: cached};
    const adapter = storeAdapter(cache, {todos: {}});

    return adapter.updateAll('todos', newCollection).then(data => {
      expect(data).to.eql([
        {id: 1, title: 'big'},
        {id: 2, title: 'bigger'},
        {id: 3, title: 'foo'},
        {id: 4, title: 'biggest'}
      ]);
    })
  })
})
