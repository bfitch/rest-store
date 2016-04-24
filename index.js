import axiosAdapter from './src/axios-adapter';
import jsStoreAdapter from './src/plain-js-store-adapter';
import config from './src/configuration';

export function restStore(mappings, storeAdapter, ajaxAdapter = axiosAdapter()) {
  if (!storeAdapter) throw new Error('No storeAdapter. You must provide an in-memory store')

  return {
    cache: storeAdapter.cache,
    http: ajaxAdapter.http,

    find(path, clientQuery, httpOptions) {
      const options = config('find', path, clientQuery, httpOptions, mappings);
      const {url, root, params, headers, force, model, query, identifier} = options;

      ajaxAdapter.setConfig({root, model});
      storeAdapter.setConfig({identifier});

      if (force) {
        return ajaxAdapter.find(url, params, headers).then(fetchedData => {
          return storeAdapter.replaceObject(path, fetchedData);
        });
      } else {
        return storeAdapter.get(path, query).then(data => {
          if (data) return data;

          const fetchedData = ajaxAdapter.find(url, params, headers);
          return fetchedData.then(data => storeAdapter.add(path, data));
        });
      }
    },

    findAll(path, clientQuery, httpOptions) {
      const options = config('findAll', path, clientQuery, httpOptions, mappings);
      const {url, root, params, headers, force, model, query, identifier} = options;

      ajaxAdapter.setConfig({root, model});
      storeAdapter.setConfig({identifier});

      if (force) {
        return ajaxAdapter.find(url, params, headers).then(fetchedData => {
          return storeAdapter.replace(path, fetchedData);
        });
      } else {
        return storeAdapter.getCollection(path, query).then(data => {
          if (data) return data;

          return ajaxAdapter.find(url, params, headers)
            .then(data => storeAdapter.mergeCollection(path, data))
            .then(data => storeAdapter.queryStore('filter', data, query));
        });
      }
    },

    create(path, attributes, httpOptions) {
      const options = config('create', path, {}, httpOptions, mappings);
      const {url, root, params, headers, model, identifier} = options;

      const ajax  = ajaxAdapter({root, model});
      const store = storeAdapter({identifier});

      return ajax.create(url, attributes, params, headers).then(fetchedData => {
        return store.add(path, fetchedData);
      });
    },

    update(path, clientQuery, attributes, httpOptions) {
      const options = config('update', path, clientQuery, httpOptions, mappings);
      const {url, root, params, headers, model, identifier} = options;

      const ajax  = ajaxAdapter({root, model});
      const store = storeAdapter({identifier});

      return ajax.update(url, attributes, params, headers).then(fetchedData => {
        return store.replaceObject(path, fetchedData);
      });
    },

    delete(path, clientQuery, httpOptions) {
      const options = config('delete', path, clientQuery, httpOptions, mappings);
      const {url, root, params, headers, model, identifier} = options;

      const ajax  = ajaxAdapter({root, model});
      const store = storeAdapter({identifier});

      return ajax.delete(url, params, headers).then(fetchedData => {
        return store.removeObject(path, clientQuery);
      });

    }
  }
}

export {jsStoreAdapter};
