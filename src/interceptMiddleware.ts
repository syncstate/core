import { produce } from 'immer';
import get from 'lodash.get';

export const createInterceptMiddleware = (interceptCallbacks: any) => {
  return (store: any) => (next: any) => (action: any) => {
    let discardAction = false;

    if (action.type === 'PATCH') {
      interceptCallbacks.forEach((interceptor: any) => {
        if (discardAction) {
          return;
        }
        const payloadPath = action.payload.patch.path;

        if (interceptor.subtree !== action.payload.subtree) {
          // Skip this interceptor if interceptor and action.payload subtrees do not match
          return;
        }

        // If path above the interceptor path changes call interceptor for all cases
        if (interceptor.path.join('/').startsWith(payloadPath.join('/'))) {
          discardAction = callInterceptor(interceptor, store, action);
        }

        // If depth x, call for x levels extra below interceptor path
        else if (interceptor.depth > 0 && interceptor.depth !== Infinity) {
          const matchingLengthPayloadPath = payloadPath.slice(
            0,
            interceptor.path.length
          );
          const remainingPayloadPathLength =
            payloadPath.length - matchingLengthPayloadPath.length;

          if (
            matchingLengthPayloadPath.join('/') ===
              interceptor.path.join('/') &&
            remainingPayloadPathLength <= interceptor.depth
          ) {
            discardAction = callInterceptor(interceptor, store, action);
          }
        }

        //If depth is infinity, call for any number of levels below interceptor path
        else if (interceptor.depth === Infinity) {
          if (payloadPath.join('/').startsWith(interceptor.path.join('/'))) {
            discardAction = callInterceptor(interceptor, store, action);
          }
        }
      });
    }

    if (!discardAction) {
      return next(action);
    }
  };
};

function callInterceptor(interceptor: any, store: any, action: any) {
  const newPayload = interceptor.callback(
    get(
      store.getState()[interceptor.subtree],
      'state.' + interceptor.path.join('.')
    ),
    action.payload
  );
  action.payload = newPayload;

  if (newPayload === null) {
    return true; // discard action
  }
  return false;
}
