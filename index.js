import axiosAdapter from './src/axios-adapter';
import config from './src/configuration';

export default function(mappings, storeAdapter, ajaxAdapter = axiosAdapter()) {
  if (!storeAdapter) throw new Error('No storeAdapter. You must provide an in-memory store')

  return {
    find(path, clientQuery, httpOptions) {
      const options = config('find', path, clientQuery, httpOptions, mappings);
      const {url, root, params, headers, force, model, query, identifier} = options;

      const ajax  = ajaxAdapter({root, model});
      const store = storeAdapter({identifier});

      if (force) {
        return ajax.find(url, params, headers).then(fetchedData => {
          return store.replaceObject(path, fetchedData);
        });
      } else {
        return store.get(path, query).then(data => {
          if (data) return data;

          const fetchedData = ajax.find(url, params, headers);
          return fetchedData.then(data => store.add(path, data));
        });
      }
    },

    findAll(path, clientQuery, httpOptions) {
      const options = config('find', path, clientQuery, httpOptions, mappings);
      const {url, root, params, headers, force, model, query, identifier} = options;

      const ajax  = ajaxAdapter({root, model});
      const store = storeAdapter({identifier});

      if (force) {
        return ajax.findAll(url, params, headers).then(fetchedData => {
          return store.replace(path, fetchedData);
        });
      } else {
        return store.getCollection(path, query).then(data => {
          if (data) return data;

          const fetchedData = ajax.findAll(url, params, headers);
          return fetchedData.then(data => store.replace(path, data));
        });
      }
    },

  }
}
