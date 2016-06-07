/* @flow */

export function convertToMocha(obj: Object) {
  const name = obj.constructor.name;
  const tests = Object.getOwnPropertyNames(Object.getPrototypeOf(obj))
    .filter(name => name.startsWith('test'))
    .filter(name => typeof obj[name] === 'function');

  describe(obj.constructor.name, () => {
    Object.getOwnPropertyNames(Object.getPrototypeOf(obj))
      .filter(name => name.startsWith('test'))
      .filter(name => typeof obj[name] === 'function')
      .forEach(name => it(name, () => obj[name]()));
  });
}
