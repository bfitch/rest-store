import { describe, it } from 'mocha'
import { expect } from 'chai'
import storeAdapter, { getPath, setPath } from '../src/store-adapters/javascript'

describe('storeAdapter', function () {
  it('exposes the raw cache', function () {
    const cache = {}
    const store = storeAdapter(cache)

    expect(store.cache).to.equal(cache)
  })

  describe('setPath', function () {
    const cache = {
      foo: {
        bar: {
          baz: 'baz'
        }
      },
      bat: 'thing'
    }

    it('sets the value at a nested path', function () {
      setPath(cache, 'foo.bar.baz', 'woot')
      expect(cache.foo.bar.baz).to.eql('woot')
    })

    it('sets the value at a non-nested path', function () {
      setPath(cache, 'bat', 'woot')
      expect(cache.bat).to.eql('woot')
    })

    it('throws a helpful error message for a non-nested path', function () {
      expect(() => { setPath(cache, 'bee', 'wow') }).to.throw(Error,
        "Can not set value: 'wow' at path: 'bee'. Key: 'bee' could not be found in the store")
    })

    it('throws a helpful error message for a nested path', function () {
      expect(() => { setPath(cache, 'foo.wow', 'cool') }).to.throw(Error,
        "Can not set value: 'cool' at path: 'foo.wow'. Key: 'wow' could not be found in the store")
    })
  })

  describe('getPath', function () {
    const cache = {
      foo: {
        bar: {
          baz: 'baz'
        }
      }
    }

    it('returns non-nested values', function () {
      expect(getPath(cache, 'foo')).to.eql(cache.foo)
    })

    it('returns nested values using dot notation', function () {
      expect(getPath(cache, 'foo.bar.baz')).to.eql('baz')
    })

    it('returns throws a helpful error message for non-nested paths', function () {
      expect(() => { getPath(cache, 'wow') }).to.throw(Error,
        "The key: 'wow' in path: 'wow' could not be found in the store")
    })

    it('nested value is undefined', function () {
      const cache = {
        foo: { bar: { baz: undefined } }
      }
      expect(getPath(cache, 'foo.bar.baz')).to.be.undefined
    })

    it("throws an error if the path's first key doesn't match", function () {
      expect(() => { getPath(cache, 'fee.bar.baz') }).to.throw(Error,
        "The key: 'fee' in path: 'fee.bar.baz' could not be found in the store")
    })

    it("throws an error if the path's second key doesn't match", function () {
      expect(() => { getPath(cache, 'foo.bree.baz') }).to.throw(Error,
        "The key: 'bree' in path: 'foo.bree.baz' could not be found in the store")
    })

    it("throws an error if the path's last key doesn't match", function () {
      expect(() => { getPath(cache, 'foo.bar.bee') }).to.throw(Error,
        "The key: 'bee' in path: 'foo.bar.bee' could not be found in the store")
    })
  })
})
