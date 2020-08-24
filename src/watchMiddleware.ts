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
    } else if (action.type === 'SINGLE_PATCH') {
      watchCallbacks.forEach((watch: any) => {
        if (action.payload.path.join('/').startsWith(watch.path.join('/'))) {
          watch.callback({ patch: action.payload });
        }
      });
    }

    next(action);
  };
};
