export default function(axios, {path, root, model}) {
  return {
    find(url, params, headers) {
      return axios.get(url, {params, headers})
        .then(response => {
          return normalizeResponse(response, {path, root});
        })
        .then(data => {
          return !model ? data : buildModels(data, model);
        })
    }
  }
}

function normalizeResponse(data, {path, root}) {
  const fetchedData = data || {};
  return root ? fetchedData[root] : fetchedData;
}

function buildModels(data, model) {
  return data.map(attributes => {
    return new model(attributes)
  })
}
