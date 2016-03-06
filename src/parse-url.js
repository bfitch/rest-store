import pathToRegexp from 'path-to-regexp';
import URL from 'url-parse';

export default function parseUrl(method, url, identifier, attrs) {
  const parsedUrl = URL(mapUrl(method, url, identifier));
  const pathname  = parsedUrl.pathname;
  const toPath    = pathToRegexp.compile(pathname);
  const compiled  = toPath(attrs);

  return parsedUrl.set('pathname', compiled).href;
}

function mapUrl(method, url, identifier) {
  if (method === 'findAll' || method === 'create') {
    return url;
  } else {
    return `${url}/:${identifier}`;
  }
}
