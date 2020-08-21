import * as memoizee from 'memoizee';

// tslint:disable-next-line:typedef
export function memoize() {
  return (target, key, descriptor) => {
    const oldFunction = descriptor.value;
    const newFunction = memoizee(oldFunction);
    // tslint:disable-next-line:typedef
    descriptor.value = function() {
      return newFunction.apply(this, arguments);
    };
  };
}
