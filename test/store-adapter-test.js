import {describe,it} from 'mocha'
import {expect} from 'chai'
import storeAdapter from '../src/plain-js-store-adapter'

describe('storeAdapter', function() {
  it('exposes the raw cache', function() {
    const cache = {}
    const store = storeAdapter(cache);

    expect(store.cache).to.equal(cache);
  })
})
