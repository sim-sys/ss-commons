/* @flow */

export function convertToMocha(obj: Object) {
  describe(obj.constructor.name, () => {
    Object.getOwnPropertyNames(Object.getPrototypeOf(obj))
      .filter(name => name.startsWith('test'))
      .filter(name => typeof obj[name] === 'function')
      .forEach(name => it(name, () => obj[name]()));
  });
}
