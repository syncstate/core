export const createObserveMiddleware = (observeCallbacks: any) => {
  return (store: any) => (next: any) => (action: any) => {
    next(action);

    if (action.type === 'PATCH') {
      observeCallbacks.forEach((observer: any) => {
        const payloadPath = action.payload.patch.path;

        // If path above the observer path changes call observer for all cases
        if (observer.path.join('/').startsWith(payloadPath.join('/'))) {
          observer.callback(action.payload);
        }

        // If depth x, call for x levels extra below observer path
        else if (observer.depth > 0 && observer.depth !== Infinity) {
          const matchingLengthPayloadPath = payloadPath.slice(
            0,
            observer.path.length
          );
          const remainingPayloadPathLength =
            payloadPath.length - matchingLengthPayloadPath.length;

          if (
            matchingLengthPayloadPath.join('/') === observer.path.join('/') &&
            remainingPayloadPathLength <= observer.depth
          ) {
            observer.callback(action.payload);
          }
        }

        //If depth is infinity, call for any number of levels below observer path
        else if (observer.depth === Infinity) {
          if (payloadPath.join('/').startsWith(observer.path.join('/'))) {
            observer.callback(action.payload);
          }
        }
      });
    }
  };
};
