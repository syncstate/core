import get from 'lodash.get';

export type Observer = {
  subtree: string;
  path: string;
  callback: any;
  depth: number;
};

export const createPostObserveMiddleware = (callbacks: Array<() => void>) => {
  return (store: any) => (next: any) => (action: any) => {
    const result = next(action);

    callbacks.forEach((cb, index) => {
      cb();
    });

    callbacks.length = 0;

    return result;
  };
};
