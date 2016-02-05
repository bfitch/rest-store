// import parseUrl from 'utils';

export default function(method, path, query, httpOptions, mappings) {
  const {url, root = path, identifier = 'id'}               = mappings[path];
  const {headers = {}, params = {}, force = false, ...rest} = httpOptions;
  const routeParams = Object.assign({},params,query,rest);

  return {
    get url() {
      if (!url) throw new Error('You must provide a url mapping');
      return parseUrl(method, url, identifier, routeParams);
    },
    get path() {
      return path || throw new Error('You must provide a path to store data');
    },
    get root() {
      return root === false ? false : (root || path);
    },
    params:  params,
    headers: headers,
    force:   force
  }
}

