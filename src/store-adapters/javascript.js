import config from '../configuration'
import { isEmpty } from '../utils'
const { isArray } = Array
const { assign } = Object
const NOT_FOUND = -1

export default function (store = {}, mappings = {}) {
  return {
    cache: store,

    get (path, query) {
      if (isEmpty(query)) throw new Error('You must provide a query when getting items from the store')
      return Promise.resolve(queryStore('find', getPath(store, path), query))
    },

    getCollection (path, query) {
      if (!isArray(getPath(store, path))) {
        throw new Error(`getCollection() requies the path: '${path}' to be an array. ` +
        `Is of type: ${typeof getPath(store, path)}`)
      }

      return Promise.resolve(queryStore('filter', getPath(store, path), query))
    },

    insert (path, attrs) {
      if (!isArray(getPath(store, path)) && isArray(attrs)) {
        throw new Error(`Store path: ${path} must be an array if adding a collection.`)
      }

      if (isArray(attrs)) {
        attrs.reduce((collection, item) => {
          collection.push(item)
          return collection
        }, getPath(store, path))
      } else if (!isArray(getPath(store, path))) {
        setPath(store, path, attrs)
      } else {
        getPath(store, path).push(attrs)
      }
      return Promise.resolve(attrs)
    },

    update (path, id, attrs = null, options = {replace: false}) {
      if (isArray(attrs)) throw new Error('ArgumentError: update() cannot set an array. Use updateAll() instead.')
      const {identifier} = config(mappings, path)
      let updated

      if (isArray(getPath(store, path))) {
        updated = updateCollection(store, path, id, identifier, attrs, options.replace)
      } else {
        updated = updateObject(store, path, attrs, options.replace)
      }
      return Promise.resolve(updated)
    },

    updateWhere (path, query, attrs = null, options = {replace: true}) {
      const {identifier} = config(mappings, path)
      let updated = null

      const item = queryStore('find', getPath(store, path), query)
      if (!item) throw new Error(`No object found at path: '${path}' with query: '${JSON.stringify(query)}`)

      if (isArray(getPath(store, path))) {
        updated = updateCollection(store, path, item[identifier], identifier, attrs, options.replace)
      } else {
        updated = updateObject(store, path, attrs, options.replace)
      }
      return Promise.resolve(updated)
    },

    updateAll (path, collection, options = {}) {
      if (!isArray(getPath(store, path))) throw new Error(`Store path: ${path} must be an array when adding a collection.`)
      if (isEmpty(collection)) throw new Error(`updateAll() should not be used to update the store path: ${path} with an empty collection.`)

      const {identifier} = config(mappings, path)

      const index = collection.findIndex(item => identifier in item)
      if (index === NOT_FOUND) throw new Error(`Collection has no property: '${identifier}'`)

      const storeIds = getPath(store, path).map(item => item[identifier])
      const collectionIds = collection.map(item => item[identifier])
      const idsToRemove = storeIds.filter(id => collectionIds.indexOf(id) < 0)

      if (!isEmpty(idsToRemove)) idsToRemove.forEach(id => this.update(path, id))

      const updated = collection.map(item => this.update(path, item[identifier], item, options))
      return Promise.all(updated)
    }
  }
}

function updateObject (store, path, attrs, replace) {
  if (attrs === null) {
    const deleted = getPath(store, path)
    setPath(store, path, attrs)
    return deleted
  } else if (replace || attrs === null) {
    return setPath(store, path, attrs)
  } else {
    assign(getPath(store, path), attrs)
    return getPath(store, path)
  }
}

function updateCollection (store, path, id, identifier, attrs, replace) {
  const index = getPath(store, path).findIndex(item => item[identifier] === id)

  if (index === NOT_FOUND && attrs === null) {
    throw new Error(`No object found at path: '${path}' with '${identifier}': ${id}.`)
  }

  if (index === NOT_FOUND) {
    getPath(store, path).push(attrs)
    return attrs
  } else if (attrs === null) {
    const deleted = getPath(store, path)[index]
    getPath(store, path).splice(index, 1)
    return deleted
  } else if (replace) {
    getPath(store, path).splice(index, 1, attrs)
    return attrs
  } else {
    const updated = assign({}, getPath(store, path)[index], attrs)
    getPath(store, path).splice(index, 1, updated)
    return updated
  }
}

function queryStore (method, cachedData, query) {
  if (isEmpty(cachedData)) return null
  if (isEmpty(query)) return cachedData
  let result

  if (isArray(cachedData)) {
    result = cachedData[method](item => {
      return Object.keys(query).reduce((bool, queryKey) => {
        return bool && (item[queryKey] === query[queryKey])
      }, true)
    })
  } else {
    const check = Object.keys(query).reduce((bool, queryKey) => {
      return bool && (cachedData[queryKey] === query[queryKey])
    }, true)
    result = check ? cachedData : null
  }

  return isEmpty(result) ? null : result
}

export function getPath (store, pathString) {
  const path = pathString.split('.')

  return path.reduce((memo, key) => {
    if (!(key in memo)) {
      const msg = `The key: '${key}' in path: '${pathString}' could not be found in the store`
      throw new Error(msg)
    } else {
      return memo[key]
    }
  }, store)
}

export function setPath (store, pathString, value) {
  const path = pathString.split('.')

  return path.reduce((node, key, index) => {
    const msg = `Can not set value: '${value}' at path: '${pathString}'. Key: '${key}' could not be found in the store`
    if (!(key in node)) throw new Error(msg)

    node[key] = (index + 1 < path.length)
      ? node[key] || {}
      : value

    return node[key]
  }, store)
}
