import ajax from 'axios';
import {isEmpty} from './utils';

export default function(axios = ajax) {
  return (options) => {
    return {
      find(url, params, headers) {
        const axiosOptions = {method: 'get', url, params, headers};
        return request(axiosOptions, options);
      },

      create(url, data, params, headers) {
        const axiosOptions = {method: 'post', url, data, params, headers};
        return request(axiosOptions, options);
      },

      update(url, data, params, headers) {
        const axiosOptions = {method: 'put', url, data, params, headers};
        return request(axiosOptions, options);
      },

      delete(url, params, headers) {
        const axiosOptions = {method: 'delete', url, params, headers};
        return request(axiosOptions, options);
      }
    }

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
}
