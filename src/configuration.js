import parseUrl from './parse-url';

export default function(method, path, query, httpOptions = {}, mappings) {
  if (!mappings) throw new Error('You must provide url mappings')
  if (!path)     throw new Error('You must provide a path')

  const {url, root = path, identifier = 'id'}               = mappings[path];
  const {headers = {}, params = {}, force = false, ...rest} = httpOptions;
  const routeParams = Object.assign({}, params, query, rest);

  return {
    get url() {
      return parseUrl(method, url, identifier, routeParams);
    },
    get root() {
      return root === false ? false : (root || path);
    },
    path:    path,
    params:  params,
    headers: headers,
    force:   force
  }
}
