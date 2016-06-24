import ajax from 'axios';
import {isEmpty} from './utils';

export default function(axios = ajax) {
  const mapping = {find: 'get'};
  const gettersInstance = Object.keys(mapping).reduce((instance, apiMethod) => {
    const method = mapping[apiMethod];

    instance[apiMethod] = function(url, params, headers) {
      const axiosOptions = {method, url, params, headers};
      return request(axiosOptions);
    }
    return instance;
  },{});

  const updatersMapping = {create: 'post', update: 'put', delete: 'delete'};
  const instance = Object.keys(updatersMapping).reduce((instance, apiMethod) => {
    const method = updatersMapping[apiMethod];

    instance[apiMethod] = function(url, data, params, headers) {
      const axiosOptions = {method, url, data, params, headers};
      return request(axiosOptions);
    }
    return instance;
  }, gettersInstance);

  return Object.assign(instance, {http: axios});

  function request(axiosOptions) {
    return axios(axiosOptions).then(response => {
      return response.data;
    });
  }

  // function buildModels(data, model) {
  //   if (Array.isArray(data)) {
  //     return data.map(attrs => new model(attrs));
  //   } else {
  //     return new model(data);
  //   }
  // }
}
