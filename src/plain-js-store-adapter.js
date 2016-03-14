import {promisify,isEmpty} from './utils';

export default function (store = {}) {
  return ({identifier = 'id'} = {}) => {
    return {
      get(path, query) {
        if (store[path] === undefined) throw new Error(`No path: '${path}' exists in the store`);
        if (isEmpty(query)) throw new Error('You must provide a query when getting items from the store');

        return promisify(queryStore('find', store[path], query));
      },

      add(path, data) {
        if (store[path] === undefined) throw new Error(`No path: '${path}' exists in the store`);
        return promisify(_add(store[path], data));
      },

      replaceObject(path, object, id = identifier) {
        return promisify(_replaceObject(store, path, object, id));
      }
    }

    function _replaceObject(store, path, object, id) {
      if (isEmpty(object)) {
        store[path].push(object);
        return object;
      } else {
        const updatedData = store[path].filter(item => {
          return item[id] !== object[id];
        });
        updatedData.push(object);
        store[path] = updatedData;
        return object;
      }
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

function _parse(query) {
  const key   = Object.keys(query);
  const value = query[key];
  return [key,value];
}

function _add(cachedData, newData) {
  if (Array.isArray(cachedData)) {
    cachedData.push(newData);
    return cachedData;
  } else {
    return cachedData = newData;
  }
}

function _replace(cachedData, newData) {
  if (Array.isArray(cachedData)) {
    cachedData = newData;
    return cachedData;
  } else {
    return cachedData = newData;
  }
}
