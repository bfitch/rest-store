import ajax from 'axios';
import {isEmpty} from './utils';

export default function(axios = ajax) {
  const mapping = {find: 'get', delete: 'delete'};
  const gettersInstance = Object.keys(mapping).reduce((instance, apiMethod) => {
    const method = mapping[apiMethod];

    instance[apiMethod] = function(url, params, headers) {
      const axiosOptions = {method, url, params, headers};
      return request(axiosOptions, this.options);
    }
    return instance;
  },{});

  const updatersMapping = {create: 'post', update: 'put'};
  const instance = Object.keys(updatersMapping).reduce((instance, apiMethod) => {
    const method = updatersMapping[apiMethod];

    instance[apiMethod] = function(url, data, params, headers) {
      const axiosOptions = {method, url, data, params, headers};
      return request(axiosOptions, this.options);
    }
    return instance;
  },gettersInstance);

  return Object.assign(instance, {
    http: axios,
    options: {},
    setConfig(options) {
      this.options = options;
    }
  });

  function request(axiosOptions, {root, model}) {
    return axios(axiosOptions).then(response => {
        return normalizeResponse(response.data, {root});
      })
      .then(data => {
        return !model ? data : buildModels(data, model);
      })
  }

  function normalizeResponse(response, {root}) {
    if (root) {
      const msg = 'Expecting a root key in ajax response. But the response was empty.'
      if (isEmpty(response)) throw new Error(msg);

      const rootKey = Object.keys(response).pop();
      return response[rootKey];
    } else {
      return response;
    }
  }

  function buildModels(data, model) {
    if (Array.isArray(data)) {
      return data.map(attrs => new model(attrs));
    } else {
      return new model(data);
    }
  }
}
