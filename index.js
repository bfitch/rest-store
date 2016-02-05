import _ from '';

export default function(state, ajax, mappings) {
  return {
    find(path, query, httpOptions) {
      const {url,root,params,headers,force} = config('find', path, query, httpOptions, mappings);
      const cache = clientStore(state);  //= > {getItem: (false || new Promise(response)) }
      const ajax  = ajaxClient(ajax, buildResponse(path, root))
      const data  = cache.getItem(path, query)

      if (!force && data) {
        return data; // => then(data =>)
      } else {
        return ajax.find(url, params, headers) // => then(data => state.set('todo',
      }
    }
  }
}

function clientStore(state, toPromise) {
  return {
    getItem(path, query) {
      if (state.get(path)) {
        const cachedData = state.findWhere(query);
        return toPromise(cachedData);
      } else {
        return false;
      }
    }
  }
}

function toPromise(data) {
  return new Promise((resolve, reject) => {
    resolve(data);
  });
}

function ajaxClient(axios, buildResponse) {
  return {
    find(url, params, headers) {
      axios.get(url, {params, headers})
        .then(response => {
          return buildResponse(response);
        })
        // does this propogate the error to a chained catch?
        .catch(error => {
          return error;
        });
    }
  }
}

function buildResponse(path, root) {
  return function(data) {
    const fetchedData = data || {};
    return root ? fetchedData[root] : fetchedData;
  }
}

