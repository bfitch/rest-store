import axios from 'axios';
import {isEmpty} from './utils';

export default function(axios) {
  return (options) => {
    return {
      find(url, params, headers) {
        const axiosOptions = {method: 'get', url, params, headers};
        return request(axiosOptions, options);
      }
    }

    function request(axiosOptions, {root, model}) {
      return axios(axiosOptions).then(response => {
          return normalizeResponse(response, {root});
        })
        .then(data => {
          return !model ? data : buildModels(data, model);
        })
    }

    function normalizeResponse(response, {root}) {
      if (root) {
        const emptyMsg = 'Expecting a root key in ajax response. But the response was empty.'
        if (isEmpty(response)) throw new Error(emptyMsg);

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
