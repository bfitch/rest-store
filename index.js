import jsStoreAdapter from './src/plain-js-store-adapter';
import axiosAdapter from './src/axios-adapter';
import config from './src/configuration';

export default function(mappings, storageAdapter, ajaxClientAdapter) {
  const storeAdapter = storageAdapter    || jsStoreAdapter;
  const ajaxAdapter  = ajaxClientAdapter || axiosAdapter;

  return {
    find(path, clientQuery, httpOptions) {
      const options = config('find', path, clientQuery, httpOptions, mappings);
      const {url, root, params, headers, force, model, query, identifier} = options;

      const ajax  = ajaxAdapter({root, model});
      const store = storeAdapter({identifier});

      console.log(store)

      if (force) {
        return ajax.find(url, params, headers).then(fetchedData => {
          return store.add(path, fetchedData);
        });
      } else {
        return store.get(path, query).then(data => {
          if (data) return data;

          const fetchedData = ajax.find(url, params, headers);
          return fetchedData.then(data => store.add(path, data));
        });
      }
    }
  }
}
