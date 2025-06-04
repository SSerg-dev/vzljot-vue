export function log(target: any, key: string, descriptor: PropertyDescriptor) {
  const fn = descriptor.value;
  descriptor.value = function(...args: any[]) {
    console.log(`Entering ${key} with arguments: ${JSON.stringify(args)}`);
    const result = fn.apply(this, args);
    console.log(`Exiting ${key} with result: ${JSON.stringify(result)}`);
    return result;
  };
  return descriptor;
}

export function debounce(delay: number) {
  return function (target: any, key: string, descriptor: PropertyDescriptor) {
    let timer: ReturnType<typeof setTimeout>;
    const fn = descriptor.value;

    descriptor.value = function (...args: any[]) {
      clearTimeout(timer);
      timer = setTimeout(() => {
        fn.call(this, ...args);
      }, delay);
    };

    return descriptor;
  };
}
