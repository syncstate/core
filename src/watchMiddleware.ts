export const createWatchMiddleware = (watchCallbacks: any) => {
  return (store: any) => (next: any) => (action: any) => {
    if (action.type === 'PATCHES') {
      action.payload.forEach((patchObj: any) => {
        watchCallbacks.forEach((watch: any) => {
          if (patchObj.patch.path.join('/').startsWith(watch.path.join('/'))) {
            watch.callback(patchObj);
          }
        });
      });
    }

    next(action);
  };
};
