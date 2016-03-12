import {promisify,isEmpty} from './utils';

export default function(store = {}) {
  return {
    get(path, query) {
      if (store[path] === undefined) throw new Error(`No path: '${path}' exists in the store`);
      if (isEmpty(query)) throw new Error('You must provide a query when getting items from the store');

      return promisify(queryStore('find', store[path], query));
    }
  }
}

function queryStore(method, cachedData, query) {
  if (isEmpty(cachedData)) return null;

  const [key,value] = _parse(query);
  const result = cachedData[method].call(cachedData, (item) => item[key] === value);

  return isEmpty(result) ? null : result;
}

function _parse(query) {
  const key   = Object.keys(query);
  const value = query[key];
  return [key,value];
}
