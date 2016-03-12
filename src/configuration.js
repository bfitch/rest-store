import parseUrl from './parse-url';

export default function(method, path, query = {}, httpOptions = {}, mappings) {
  if (!mappings) throw new Error('You must provide url mappings');
  if (!path)     throw new Error('You must provide a path');

  const {url, root = true, identifier = 'id', model = false}        = mappings[path];
  const {headers = {}, params = {}, force = false, ...rest} = httpOptions;
  const routeParams = Object.assign({}, params, query, rest);

  return {
    get url() {
      return parseUrl(method, url, identifier, routeParams);
    },
    get root() {
      if (typeof root !== 'boolean') throw new Error("'root' option must be a boolean value.");
      return root;
    },
    get model() {
      if (typeof model !== 'boolean') throw new Error("'model' option must be a boolean value.");
      return model;
    },
    path:    path,
    params:  params,
    headers: headers,
    force:   force,
    query:   query
  }
}
