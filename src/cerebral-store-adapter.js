import Model from 'cerebral-model-baobab';
import config from './configuration';
import {isEmpty} from './utils';
const {isArray} = Array;
const {assign}  = Object;
const NOT_FOUND = -1;

export default function(model = Model(), mappings = {}) {
  const store = model({on(){}});

  return {
    cache: store,

    get(pathString, query) {
      const path = pathString.split('.');
      if (isEmpty(query)) throw new Error('You must provide a query when getting items from the store');
      return Promise.resolve(queryStore('find', store.accessors.get(path), query));
    },

    getCollection(pathString, query) {
      const path = pathString.split('.');
      if (!isArray(store.accessors.get(path))) throw new Error(
        `getCollection() requies the path: '${pathString}' to be an array. Is of type: ${typeof store.accessors.get(path)}`);

      return Promise.resolve(queryStore('filter', store.accessors.get(path), query));
    },

    insert(pathString, attrs) {
      const path = pathString.split('.');

      if (!isArray(store.accessors.get(path)) && isArray(attrs)) throw new Error(
        `Store path: ${path} must be an array if adding a collection.`);

      if (isArray(attrs)) {
        store.mutators.concat(path, attrs);
      } else if (!isArray(store.accessors.get(path))) {
        store.mutators.set(path, attrs);
      } else {
        store.mutators.push(path, attrs);
      }
      return Promise.resolve(attrs);
    },

    update(pathString, id, attrs = null, options = {replace: false}) {
      const path = pathString.split('.');

      if (isArray(attrs)) throw new Error('ArgumentError: update() cannot set an array. Use updateAll() instead.');
      const {identifier} = config(mappings, pathString);
      let updated;

      if (isArray(store.accessors.get(path))) {
        updated = updateCollection(store, pathString, id, identifier, attrs, options.replace);
      } else {
        updated = updateObject(store, pathString, attrs, options.replace);
      }
      return Promise.resolve(updated);
    },

    updateAll(pathString, collection, options = {}) {
      const path = pathString.split('.');

      if (!isArray(store.accessors.get(path))) throw new Error(`Store path: ${pathString} must be an array when adding a collection.`);
      if (isEmpty(collection)) throw new Error(`updateAll() should not be used to update the store path: ${pathString} with an empty collection.`);

      const {identifier} = config(mappings, pathString);

      const index = collection.findIndex(item => identifier in item);
      if (index === NOT_FOUND) throw new Error(`Collection has no property: '${identifier}'`);

      const storeIds      = store.accessors.get(path).map(item => item[identifier]);
      const collectionIds = collection.map(item => item[identifier]);
      const idsToRemove   = storeIds.filter(id => collectionIds.indexOf(id) < 0);

      if (!isEmpty(idsToRemove)) idsToRemove.forEach(id => this.update(pathString, id));

      const updated = collection.map(item => this.update(pathString, item[identifier], item, options));
      return Promise.all(updated);
    },

    updateWhere(pathString, query, attrs = null, options = {replace: true}) {
      const path = pathString.split('.');
      const {identifier} = config(mappings, pathString);
      let updated        = null;

      const item = queryStore('find', store.accessors.get(path), query);
      if (!item) throw new Error(`No object found at path: '${pathString}' with query: '${JSON.stringify(query)}`);

      if (isArray(store.accessors.get(path))) {
        updated = updateCollection(store, pathString, item[identifier], identifier, attrs, options.replace);
      } else {
        updated = updateObject(store, pathString, attrs, options.replace);
      }
      return Promise.resolve(updated);
    }
  }
}

function updateObject(store, pathString, attrs, replace) {
  const path = pathString.split('.');

  if (attrs === null) {
    const deleted = store.accessors.get(path);
    store.mutators.set(path, attrs);
    return deleted;
  } else if (replace || attrs === null) {
    store.mutators.set(path, attrs);
    return attrs;
  } else {
    store.mutators.merge(path, attrs);
    return store.accessors.get(path);
  }
}

function updateCollection(store, pathString, id, identifier, attrs, replace) {
  const path = pathString.split('.');
  const index = store.accessors.get(path).findIndex(item => item[identifier] === id);

  if (index === NOT_FOUND && attrs === null) {
    throw new Error(`No object found at path: '${pathString}' with '${identifier}': ${id}.`);
  }

  if (index === NOT_FOUND) {
    store.mutators.push(path, attrs);
    return attrs;
  } else if (attrs === null) {
    const deleted = store.accessors.get(path)[index];
    store.mutators.splice(path, index, 1);
    return deleted;
  } else if (replace) {
    store.mutators.splice(path, index, 1, attrs);
    return attrs;
  } else {
    const previous = assign({}, store.accessors.get(path)[index]);
    const updated  = assign({}, previous, attrs);
    store.mutators.splice(path, index, 1, updated);
    return updated;
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
