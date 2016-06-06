import axiosAdapter from './src/axios-adapter';
import jsStoreAdapter from './src/plain-js-store-adapter';
import config from './src/configuration';

export function restStore(mappings, storeAdapter, ajaxAdapter = axiosAdapter()) {
  if (!storeAdapter) throw new Error('No storeAdapter. You must provide an in-memory store')

  return {
    cache: storeAdapter.cache,
    http: ajaxAdapter.http,

    find(path, clientQuery, httpOptions) {
      const options = config(mappings, path, 'find', clientQuery, httpOptions);
      const {url, root, params, headers, force, model, query, identifier} = options;

      ajaxAdapter.setConfig({root, model});

      if (force) {
        return ajaxAdapter.find(url, params, headers)
          .then(fetchedData => storeAdapter.update(path, fetchedData[identifier], fetchedData, {replace: true}))
          .then(data => Array.isArray(data) ? data.pop() : data);
      } else {
        return storeAdapter.get(path, query).then(data => {
          if (data) return data;

          return ajaxAdapter.find(url, params, headers)
            .then(data => storeAdapter.insert(path, data))
            .then(data => Array.isArray(data) ? data.pop() : data);
        });
      }
    },

    findAll(path, clientQuery, httpOptions) {
      const options = config(mappings, path, 'findAll', clientQuery, httpOptions);
      const {url, root, params, headers, force, model, query, identifier} = options;

      ajaxAdapter.setConfig({root, model});

      if (force) {
        return ajaxAdapter.find(url, params, headers).then(data => {
          return storeAdapter.updateAll(path, data, {replace: true});
        });
      } else {
        return storeAdapter.getCollection(path, query).then(data => {
          if (data) return data;

          return ajaxAdapter.find(url, params, headers)
            .then(data => storeAdapter.updateAll(path, data, {replace: true}));
        });
      }
    },

    create(path, attributes, httpOptions) {
      const options = config(mappings, path, 'create', {}, httpOptions);
      const {url, root, params, headers, model, identifier} = options;

      ajaxAdapter.setConfig({root, model});

      return ajaxAdapter.create(url, attributes, params, headers).then(data => {
        return storeAdapter.setById(path, data[identifier], data);
      });
    },

    update(path, clientQuery, attributes, httpOptions) {
      const options = config(mappings, path, 'update', clientQuery, httpOptions);
      const {url, root, params, headers, model, identifier} = options;

      ajaxAdapter.setConfig({root, model});

      return ajaxAdapter.update(url, attributes, params, headers).then(data => {
        return storeAdapter.setById(path, data[identifier], data);
      });
    },

    delete(path, clientQuery, httpOptions) {
      const options = config(mappings, path, 'delete', clientQuery, httpOptions);
      const {url, root, params, headers, model, identifier} = options;

      ajaxAdapter.setConfig({root, model});

      return ajax.delete(url, params, headers).then(data => {
        return storeAdapter.setById(path, clientQuery[identifier], null);
      });
    }
  }
}

export {jsStoreAdapter};
