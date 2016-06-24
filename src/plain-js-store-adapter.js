import config from './configuration';
import {isEmpty} from './utils';
const {isArray} = Array;
const {assign}  = Object;
const NOT_FOUND = -1;

export default function(store = {}, mappings = {}) {
  return {
    cache: store,

    get(path, query) {
      checkPath(store, path);
      if (isEmpty(query)) throw new Error('You must provide a query when getting items from the store');

      return Promise.resolve(queryStore('find', store[path], query));
    },

    getCollection(path, query) {
      checkPath(store, path);

      if (!isArray(store[path])) throw new Error(
        `getCollection() requies the path: '${path}' to be an array. Is of type: ${typeof store[path]}`);

      return Promise.resolve(queryStore('filter', store[path], query));
    },

    insert(path, attrs) {
      checkPath(store, path);
      if (!isArray(store[path]) && isArray(attrs)) throw new Error(
        `Store path: ${path} must be an array if adding a collection.`);

      if (isArray(attrs)) {
        attrs.reduce((collection, item) => {
          collection.push(item);
          return collection;
        }, store[path]);
      } else if (!isArray(store[path])) {
        store[path] = attrs;
      } else {
        store[path].push(attrs);
      }

      return Promise.resolve(attrs);
    },

    update(path, id, attrs = null, options = {replace: false}) {
      checkPath(store, path);
      if (isArray(attrs)) throw new Error('ArgumentError: update() cannot set an array. Use updateAll() instead.');
      const {identifier} = config(mappings, path);
      let updated;

      if (isArray(store[path])) {
        updated = updateCollection(store, path, id, identifier, attrs, options.replace);
      } else {
        updated = updateObject(store, path, attrs, options.replace);
      }
      return Promise.resolve(updated);
    },

    updateWhere(path, query, attrs = null, options = {replace: true}) {
      checkPath(store, path);
      const {identifier} = config(mappings, path);
      let updated        = null;

      const item = queryStore('find', store[path], query);
      if (!item) throw new Error(`No object found at path: '${path}' with query: '${JSON.stringify(query)}`);

      if (isArray(store[path])) {
        updated = updateCollection(store, path, item[identifier], identifier, attrs, options.replace);
      } else {
        updated = updateObject(store, path, attrs, options.replace);
      }
      return Promise.resolve(updated);
    },

    updateAll(path, collection, options = {}) {
      checkPath(store, path);
      if (!isArray(store[path])) throw new Error(`Store path: ${path} must be an array when adding a collection.`);
      if (isEmpty(collection)) throw new Error(`updateAll() should not be used to update the store path: ${path} with an empty collection.`);

      const {identifier} = config(mappings, path);

      const index = collection.findIndex(item => identifier in item);
      if (index === NOT_FOUND) throw new Error(`Collection has no property: '${identifier}'`);

      const storeIds      = store[path].map(item => item[identifier]);
      const collectionIds = collection.map(item => item[identifier]);
      const idsToRemove   = storeIds.filter(id => collectionIds.indexOf(id) < 0);

      if (!isEmpty(idsToRemove)) idsToRemove.forEach(id => this.update(path, id));

      const updated = collection.map(item => this.update(path, item[identifier], item, options));
      return Promise.all(updated);
    }
  }
}

function updateObject(store, path, attrs, replace) {
  if (attrs === null) {
    const deleted = store[path];
    store[path] = attrs;
    return deleted;
  } else if (replace || attrs === null) {
    return store[path] = attrs;
  } else {
    assign(store[path], attrs);
    return store[path];
  }
}

function updateCollection(store, path, id, identifier, attrs, replace) {
  const index = store[path].findIndex(item => item[identifier] === id);

  if (index === NOT_FOUND && attrs === null) {
    throw new Error(`No object found at path: '${path}' with '${identifier}': ${id}.`);
  }

  if (index === NOT_FOUND) {
    store[path].push(attrs);
    return attrs;
  } else if (attrs === null) {
    const deleted = store[path][index];
    store[path].splice(index, 1);
    return deleted;
  } else if (replace) {
    store[path].splice(index, 1, attrs);
    return attrs;
  } else {
    const updated = assign({}, store[path][index], attrs);
    store[path].splice(index, 1, updated);
    return updated
  }
}

function queryStore(method, cachedData, query) {
  if (isEmpty(cachedData)) return null;
  if (isEmpty(query)) return isEmpty(cachedData) ? null : cachedData;
  let result;

  if (isArray(cachedData)) {
    result = cachedData[method].call(cachedData, (item) => {
      return Object.keys(query).reduce((bool, queryKey) => {
        return bool && (item[queryKey] === query[queryKey]);
      }, true);
    });
  } else {
    const check = Object.keys(query).reduce((bool, queryKey) => {
      return bool && (cachedData[queryKey] === query[queryKey]);
    }, true);
    result = check ? cachedData : null;
  }

  return isEmpty(result) ? null : result;
}

function checkPath(store, path) {
  if (store[path] === undefined) throw new Error(`No path: '${path}' exists in the store`);
}
