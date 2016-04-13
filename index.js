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
      const options = config('findAll', path, clientQuery, httpOptions, mappings);
      const {url, root, params, headers, force, model, query, identifier} = options;

      const ajax  = ajaxAdapter({root, model});
      const store = storeAdapter({identifier});

      if (force) {
        return ajax.find(url, params, headers).then(fetchedData => {
          return store.replace(path, fetchedData);
        });
      } else {
        return store.getCollection(path, query).then(data => {
          if (data) return data;

          const fetchedData = ajax.find(url, params, headers);
          return fetchedData.then(data => store.addCollection(path, data));
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
