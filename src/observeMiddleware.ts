import get from 'lodash.get';

export const createObserveMiddleware = (observeCallbacks: any) => {
  return (store: any) => (next: any) => (action: any) => {
    const result = next(action);

    if (action.type === 'PATCH') {
      observeCallbacks.forEach((observer: any) => {
        const payloadPath = action.payload.patch.path;

        console.log(
          store.getState()[observer.subtree],
          observer.path.join('.'),
          '&&**'
        );

        if (observer.subtree !== action.payload.subtree) {
          // Skip this observer if observer and action.payload subtrees do not match
          return;
        }

        // If path above the observer path changes call observer for all cases
        if (observer.path.join('/').startsWith(payloadPath.join('/'))) {
          callObserver(observer, store, action);
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
            callObserver(observer, store, action);
          }
        }

        //If depth is infinity, call for any number of levels below observer path
        else if (observer.depth === Infinity) {
          if (payloadPath.join('/').startsWith(observer.path.join('/'))) {
            callObserver(observer, store, action);
          }
        }
      });
    }

    return result;
  };
};
function callObserver(observer: any, store: any, action: any) {
  observer.callback(
    get(store.getState()[observer.subtree], 'state.' + observer.path.join('.')),
    action.payload
  );
}
