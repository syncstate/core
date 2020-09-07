import { produce } from 'immer';
import get from 'lodash.get';

export type Interceptor = {
  subtree: string;
  path: string;
  callback: any;
  depth: number;
};

export const createInterceptMiddleware = (
  interceptors: Map<number, Interceptor>
) => {
  return (store: any) => (next: any) => (action: any) => {
    let discardAction = false;

    if (action.type === 'PATCH') {
      interceptors.forEach(interceptor => {
        if (discardAction) {
          return;
        }
        const payloadPath: string = action.payload.patch.path;

        if (interceptor.subtree !== action.payload.subtree) {
          // Skip this interceptor if interceptor and action.payload subtrees do not match
          return;
        }

        // If path above the interceptor path changes call interceptor for all cases
        if (interceptor.path.startsWith(payloadPath)) {
          discardAction = callInterceptor(interceptor, store, action);
        }

        // If depth x, call for x levels extra below interceptor path
        else if (interceptor.depth > 0 && interceptor.depth !== Infinity) {
          const matchingLengthPayloadPathArray = payloadPath
            .split('/')
            .slice(0, interceptor.path.split('/').length);
          const remainingPayloadPathLength =
            payloadPath.split('/').length -
            matchingLengthPayloadPathArray.length;

          if (
            matchingLengthPayloadPathArray.join('/') === interceptor.path &&
            remainingPayloadPathLength <= interceptor.depth
          ) {
            discardAction = callInterceptor(interceptor, store, action);
          }
        }

        //If depth is infinity, call for any number of levels below interceptor path
        else if (interceptor.depth === Infinity) {
          if (payloadPath.startsWith(interceptor.path)) {
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
      'state' + interceptor.path.replaceAll('/', '.')
    ),
    action.payload
  );
  action.payload = newPayload;

  if (newPayload === null) {
    return true; // discard action
  }
  return false;
}
