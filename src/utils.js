export function isEmpty(object) {
  if (!object) {
    return true;
  } else if (object.constructor.name === 'Array') {
    return !object.length > 0;
  } else {
    return !Object.keys(object).length > 0;
  }
}
