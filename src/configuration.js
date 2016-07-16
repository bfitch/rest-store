import parseUrl from './parse-url'
const isArray = Array.isArray

export default function (mappings, pathString, method, query = {}, httpOptions = {}) {
  if (!pathString) throw new Error('You must provide a path')

  const path = pathString.split('.').shift()

  if (!mappings) throw new Error('You must provide url mappings')
  if (!mappings[path]) throw new Error(`No key '${path}' found in mapping configuration`)

  const {
    url,
    identifier = 'id',
    transformResponse = {transforms: defaultResponseTransform}
  } = mappings[path]

  const {
    headers = {},
    params = {},
    force = false,
    ...rest
  } = httpOptions

  const routeParams = Object.assign({}, params, query, rest)

  return {
    get url () {
      return parseUrl(method, url, identifier, routeParams)
    },
    params,
    headers,
    force,
    query,
    identifier,
    transformResponse: composeTransformations(transformResponse)
  }
}

function composeTransformations ({transforms, defaultTransform = {defaultTransform: true}}) {
  if (isArray(transforms)) {
    const fullTransforms = defaultTransform
      ? [defaultResponseTransform].concat(transforms)
      : transforms

    return function (response, store, config) {
      return fullTransforms.reduce((value, fn) => {
        return fn(value, store, config)
      }, response)
    }
  } else {
    // single function, not a pipeline
    return transforms
  }
}

function defaultResponseTransform (response, store, config) {
  const keys = Object.keys(response)
  return (keys.length === 1) ? response[keys.pop()] : response
}
