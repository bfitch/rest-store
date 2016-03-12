import {promisify,isEmpty} from './utils';

export default function(store = {}) {
  return {
    get(path, query) {
      if (store[path] === undefined) throw new Error(`No path: '${path}' exists in the store`);
      if (isEmpty(query)) throw new Error('You must provide a query when getting items from the store');

      const cachedData = store[path];

      return promisify(getQuery(cachedData, query));
    }
  }
}

function getQuery(cachedData, query) {
  if (isEmpty(cachedData)) {
    return null;
  } else {
    const key         = Object.keys(query);
    const value       = query[key];
    const queryResult = cachedData.find(item => item[key] === value);

    return isEmpty(queryResult) ? null : queryResult;
  }
}
