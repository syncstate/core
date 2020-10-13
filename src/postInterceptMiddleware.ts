export const createPostInterceptMiddleware = (callbacks: Array<() => void>) => {
  return (store: any) => (next: any) => (action: any) => {
    const result = next(action);

    callbacks.forEach((cb, index) => {
      cb();
    });

    callbacks.length = 0;

    return result;
  };
};
