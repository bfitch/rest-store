import parseUrl from './parse-url';

export default function(mappings, path, method, query = {}, httpOptions = {}) {
  if (!mappings)       throw new Error('You must provide url mappings');
  if (!path)           throw new Error('You must provide a path');
  if (!mappings[path]) throw new Error(`No key '${path}' found in mapping configuration`)

  const {
    url,
    identifier        = 'id',
    transformResponse = defaultTransformResponse
  } = mappings[path];

  const {
    headers = {},
    params  = {},
    force   = false,
    ...rest
  } = httpOptions;

  const routeParams = Object.assign({}, params, query, rest);

  return {
    get url() {
      return parseUrl(method, url, identifier, routeParams);
    },
    path,
    params,
    headers,
    force,
    query,
    identifier,
    transformResponse
  }
}

function defaultTransformResponse(response, store, config) {
  const keys = Object.keys(response);
  return (keys.length === 1) ? response[keys.pop()] : response;
}
