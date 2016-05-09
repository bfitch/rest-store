import config from './configuration';
import {promisify,isEmpty} from './utils';
import flatten from 'lodash.flattendeep';
import isObject from 'lodash.isobject';
const {isArray} = Array;

export default function(store = {}, mappings = {}) {
  return {
    cache: store,

    get(path, query) {
      checkPath(store, path);
      if (isEmpty(query)) throw new Error('You must provide a query when getting items from the store');

      return promisify(queryStore('find', store[path], query));
    },

    getCollection(path, query) {
      checkPath(store, path);
      return promisify(queryStore('filter', store[path], query));
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

      return promisify(attrs);
    },

    update(path, id, attrs = null, options = {replace: false}) {
      checkPath(store, path);
      if (isArray(attrs)) throw new Error('ArgumentError: update() cannot set an array. Use updateAll() instead.');
      const {identifier} = config(mappings, path);
      const {replace}    = options;
      let updated;

      if (isArray(store[path])) {
        updated = updateCollection(
          store, path, id,
          identifier, attrs, replace
        );
      } else {
        updated = updateObject(store, path, attrs, replace);
      }
      return promisify(updated);
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
    Object.assign(store[path], attrs);
    return store[path];
  }
}

function updateCollection(store, path, id, identifier, attrs, replace) {
  const index = store[path].findIndex(item => item[identifier] === id);
  if (index === -1) throw new Error(`No object found with '${identifier}': ${id}.`);

  if (attrs === null) {
    const deleted = store[path][index];
    store[path].splice(index, 1);
    return deleted;
  } else if (replace) {
    store[path].splice(index, 1, attrs);
    return attrs;
  } else {
    const updated = Object.assign({}, store[path][index], attrs);
    store[path].splice(index, 1, updated);
    return updated
  }
}

function queryStore(method, cachedData, query) {
  let result;
  if (isEmpty(cachedData)) return null;
  if (isEmpty(query)) return isEmpty(cachedData) ? null : cachedData;

  if (Array.isArray(cachedData)) {
    result = cachedData[method].call(cachedData, (item) => {
      return Object.keys(query).reduce((bool, queryKey) => {
        return bool && (item[queryKey] === query[queryKey]);
      },true);
    });
  } else {
    const msg = `Data at this path is not iterable. Is of type: ${typeof cachedData}`;
    if (method === 'filter') throw new Error(msg);

    const check = Object.keys(query).reduce((bool, queryKey) => {
      return bool && (cachedData[queryKey] === query[queryKey]);
    },true);
    result = check ? cachedData : null;
  }

  return isEmpty(result) ? null : result;
}

function checkPath(store, path) {
  if (store[path] === undefined) throw new Error(`No path: '${path}' exists in the store`);
}
