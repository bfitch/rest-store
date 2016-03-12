import storeAdapter from './src/plain-js-store-adapter';
import ajaxAdapter from './src/axios-adapter';

export default function(storeAdapter = storeAdapter, ajaxAdapter = ajaxAdapter, mappings) {
  return {
    find(path, query, httpOptions) {
      const options = config('find', path, query, httpOptions, mappings);
      const {url, root, params, headers, force, model, query} = options;
      const ajax = ajaxAdapter(ajax, {path, root, model})

      if (force) {
        return ajax.find(url, params, headers);
      } else {
        return storeAdapter.get(path, query).then(data => {
          return data || ajax.find(url, params, headers);
        })
      }
    }
  }
}
