import {promisify,isEmpty} from './utils';

export default function jsStoreAdapter(store = {}) {
  return ({identifier = 'id'} = {}) => {
    return {
      cache: store,

      get(path, query) {
        if (store[path] === undefined) throw new Error(`No path: '${path}' exists in the store`);
        if (isEmpty(query)) throw new Error('You must provide a query when getting items from the store');

        return promisify(queryStore('find', store[path], query));
      },

      getCollection(path, query) {
        if (store[path] === undefined) throw new Error(`No path: '${path}' exists in the store`);
        if (isEmpty(query)) throw new Error('You must provide a query when getting items from the store');

        return promisify(queryStore('filter', store[path], query));
      },

      add(path, data) {
        if (store[path] === undefined) throw new Error(`No path: '${path}' exists in the store`);
        return promisify(_add(store[path], data));
      },

      mergeCollection(path, data, id = identifier) {
        return promisify(_mergeCollection(store, path, data, id));
      },

      replaceObject(path, object, id = identifier) {
        return promisify(_replaceObject(store, path, object, id));
      },

      removeObject(path, attributes) {
        return promisify(_removeObject(store, path, attributes));
      },

      replace(path, data) {
        store[path] = data;
        return promisify(store[path]);
      }
    }

    function _replaceObject(store, path, object, id) {
      if (isEmpty(object)) {
        store[path].push(object);
        return object;
      } else {
        const index = store[path].findIndex(item => {
          return item[id] === object[id];
        });
        store[path].splice(index, 1, object);
        return object;
      }
    }

    function _mergeCollection(store, path, newCollection, identifier = 'id') {
      const cachedData = store[path];
      const cached = cachedData.reduce((memo, object) => {
        return Object.assign(memo, {[object[identifier]]: object});
      },{});

      const payload = newCollection.reduce((memo, object) => {
        return Object.assign(memo, {[object[identifier]]: object});
      },{});

      const updated = Object.assign(cached, payload);

      const newCache = Object.keys(updated).reduce((memo, key) => {
        return memo.concat([updated[key]]);
      },[]);
      store[path] = newCache;
      return store[path];
    }

    function _removeObject(store, path, attrs) {
      const [key,value] = _parse(attrs);

      const index = store[path].findIndex(item => {
        return item[key] === value;
      });
      return store[path].splice(index, 1);
    }
  }
}

function queryStore(method, cachedData, query) {
  if (isEmpty(cachedData)) return null;

  let result;
  const [key,value] = _parse(query);

  if (Array.isArray(cachedData)) {
    result = cachedData[method].call(cachedData, (item) => item[key] === value);
  } else {
    const msg = `Data at this path is not iterable. Is of type: ${typeof cachedData}`;
    if (method === 'filter') throw new Error(msg);
    result = (cachedData[key] === value) ? cachedData : null;
  }

  return isEmpty(result) ? null : result;
}

function _add(cachedData, newData) {
  if (Array.isArray(cachedData)) {
    cachedData.push(newData);
    return newData;
  } else {
    return cachedData = newData;
  }
}

function _parse(query) {
  const key   = Object.keys(query);
  const value = query[key];
  return [key,value];
}

function _replace(cachedData, newData) {
  if (Array.isArray(cachedData)) {
    cachedData = newData;
    return cachedData;
  } else {
    return cachedData = newData;
  }
}
