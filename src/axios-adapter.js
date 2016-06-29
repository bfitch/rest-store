import ajax from 'axios';
import {isEmpty} from './utils';

export default function(axios = ajax) {
  const MAPPING = {
    find:   'get',
    create: 'post',
    update: 'put',
    delete: 'delete'
  };

  const adapter = Object.keys(MAPPING).reduce((instance, apiMethod) => {
    const method = MAPPING[apiMethod];

    instance[apiMethod] = (apiMethod === 'find') ?
      (url, params, headers)       => request({method, url, params, headers}) :
      (url, data, params, headers) => request({method, url, data, params, headers});

    return instance;
  }, {});

  return Object.assign(adapter, {http: axios});

  function request(axiosOptions) {
    return axios(axiosOptions).then(response => {
      return response.data;
    });
  }
}
