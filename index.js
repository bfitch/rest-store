import uuid from 'node-uuid';
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
          .then(data => Array.isArray(data) ? data.pop() : data)
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

    create(path, attributes, options = {}) {
      const opts = config(mappings, path, 'create', {}, options);
      const {url, root, params, headers, model, identifier} = opts;
      ajaxAdapter.setConfig({root, model});

      if (options.wait) {
        return ajaxAdapter.create(url, attributes, params, headers)
          .then(data => storeAdapter.insert(path, data));
      } else {
        const _cid = uuid.v4();
        const optimisticUpdate = Object.assign({}, attributes, {_cid});

        return storeAdapter.insert(path, optimisticUpdate).then(update => {
          return ajaxAdapter.create(url, attributes, params, headers)
            .then(data => {
              return storeAdapter.updateWhere(path, {_cid}, data, {replace: true});
            })
            .catch(response => {
              storeAdapter.updateWhere(path, {_cid}, null);
              throw response;
            });
          });
      }
    },

    update(path, clientQuery, attributes, options = {}) {
      const opts = config(mappings, path, 'update', clientQuery, options);
      const {url, root, params, headers, model, identifier} = opts;

      ajaxAdapter.setConfig({root, model});

      if (options.wait) {
        return ajaxAdapter.update(url, attributes, params, headers).then(data => {
          return storeAdapter.update(path, data[identifier], data, {replace: true});
        });
      } else {
        const _cid = uuid.v4();
        const optimisticUpdate = Object.assign({}, attributes, {_cid});
        let original = null;

        storeAdapter.get(path, clientQuery).then(data => original = data);

        return storeAdapter.update(path, attributes[identifier], optimisticUpdate, {replace: true})
          .then(update => {
            return ajaxAdapter.update(url, attributes, params, headers)
              .then(data => {
                return storeAdapter.updateWhere(path, {_cid}, data, {replace: true});
              })
              .catch(response => {
                storeAdapter.updateWhere(path, {_cid}, original, {replace: true});
                throw response;
              });
          });
      }
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
