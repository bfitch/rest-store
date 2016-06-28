import uuid from 'node-uuid';
import axiosAdapter from './src/axios-adapter';
import jsStoreAdapter from './src/plain-js-store-adapter';
import config from './src/configuration';
import {isEmpty} from './src/utils';
const {assign} = Object;

export function restStore(mappings, storeAdapter, ajaxAdapter = axiosAdapter()) {
  if (!storeAdapter) throw new Error('No storeAdapter. You must provide an in-memory store');

  return {
    cache: storeAdapter.cache,
    http: ajaxAdapter.http,

    find(path, clientQuery, httpOptions) {
      const options = config(mappings, path, 'find', clientQuery, httpOptions);
      const {
        url,
        params,
        headers,
        force,
        query,
        identifier,
        transformResponse
      } = options;

      if (force) {
        return ajaxAdapter.find(url, params, headers)
          .then(fetchedData => {
            const transformedData = transformResponse(fetchedData, storeAdapter, options);
            return storeAdapter.update(path, transformedData[identifier], transformedData, {replace: true});
          })
      } else {
        return storeAdapter.get(path, query).then(data => {
          if (data) return data;

          return ajaxAdapter.find(url, params, headers)
            .then(data => storeAdapter.insert(path, transformResponse(data, storeAdapter, options)))
        });
      }
    },

    findAll(path, clientQuery, httpOptions) {
      const options = config(mappings, path, 'findAll', clientQuery, httpOptions);
      const {
        url,
        params,
        headers,
        force,
        query,
        identifier,
        transformResponse
      } = options;

      if (force) {
        return ajaxAdapter.find(url, params, headers).then(data => {
          const transformedData = transformResponse(data, storeAdapter, options);
          return storeAdapter.updateAll(path, transformedData, {replace: true});
        });
      } else {
        return storeAdapter.getCollection(path, query).then(data => {
          if (data) return data;

          return ajaxAdapter.find(url, params, headers)
            .then(data => {
              const transformedData = transformResponse(data, storeAdapter, options);
              return storeAdapter.updateAll(path, transformResponse(data), {replace: true});
            });
        });
      }
    },

    create(path, attributes, options = {}) {
      const opts = config(mappings, path, 'create', {}, assign({}, attributes, options));
      const {
        url,
        params,
        headers,
        identifier,
        transformResponse
      } = opts;

      if (options.wait) {
        return ajaxAdapter.create(url, attributes, params, headers)
          .then(data => storeAdapter.insert(path, transformResponse(data, storeAdapter, options)));
      } else {
        const _cid = uuid.v4();
        const optimisticUpdate = assign({}, attributes, {_cid});

        return storeAdapter.insert(path, optimisticUpdate).then(update => {
          return ajaxAdapter.create(url, attributes, params, headers)
            .then(data => {
              const transformedData = transformResponse(data, storeAdapter, options);
              return storeAdapter.updateWhere(path, {_cid}, transformedData, {replace: true});
            })
            .catch(response => {
              storeAdapter.updateWhere(path, {_cid}, null);
              throw response;
            });
          });
      }
    },

    update(path, clientQuery, attributes, options = {}) {
      const opts = config(mappings, path, 'update', clientQuery, assign({}, attributes, options));
      const {
        url,
        params,
        headers,
        identifier,
        transformResponse
      } = opts;

      if (options.wait) {
        return ajaxAdapter.update(url, attributes, params, headers).then(data => {
          const transformedData = transformResponse(data, storeAdapter, options);
          return storeAdapter.update(path, transformedData[identifier], transformedData, {replace: true});
        });
      } else {
        const _cid             = uuid.v4();
        const optimisticUpdate = assign({}, attributes, {_cid});
        let original           = null;

        storeAdapter.get(path, clientQuery).then(data => original = data);

        return storeAdapter.update(path, attributes[identifier], optimisticUpdate, {replace: true})
          .then(() => {
            return ajaxAdapter.update(url, attributes, params, headers)
              .then(data => {
                const transformedData = transformResponse(data, storeAdapter, options);
                return storeAdapter.updateWhere(path, {_cid}, transformedData, {replace: true});
              })
              .catch(response => {
                storeAdapter.updateWhere(path, {_cid}, original, {replace: true});
                throw response;
              });
          });
      }
    },

    delete(path, clientQuery, options = {}) {
      const opts = config(mappings, path, 'delete', clientQuery, options);
      const {
        url,
        params,
        headers,
        identifier,
        transformResponse
      } = opts;

      return storeAdapter.get(path, clientQuery).then(data => {
        if (isEmpty(data)) {
          const msg = `No data to delete at path: ${path} with query: ${JSON.stringify(clientQuery)}`
          throw new Error(msg);
        } else {
          return data;
        }
      })
      .then(data => {
        if (options.wait) {
          return ajaxAdapter.delete(url, data, params, headers).then(deleted => {
            const transformedData = transformResponse(deleted, storeAdapter, options);
            return storeAdapter.update(path, transformedData[identifier]);
          });
        } else {
          return storeAdapter.update(path, data[identifier]).then(() => {
            return ajaxAdapter.delete(url, data, params, headers)
              .then(response => transformResponse(response, storeAdapter, options))
              .catch(response => {
                storeAdapter.insert(path, assign({}, data));
                throw response;
              });
          })
        }
      });
    }
  }
}

export {jsStoreAdapter};
