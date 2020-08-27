export const createInterceptMiddleware = (interceptCallbacks: any) => {
  return (store: any) => (next: any) => (action: any) => {
    let discardAction = false;

    if (action.type === 'PATCH') {
      interceptCallbacks.forEach((interceptor: any) => {
        const payloadPath = action.payload.patch.path;

        // If path above the interceptor path changes call interceptor for all cases
        if (interceptor.path.join('/').startsWith(payloadPath.join('/'))) {
          discardAction = intercept(interceptor, action);
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
            discardAction = intercept(interceptor, action);
          }
        }

        //If depth is infinity, call for any number of levels below interceptor path
        else if (interceptor.depth === Infinity) {
          if (payloadPath.join('/').startsWith(interceptor.path.join('/'))) {
            discardAction = intercept(interceptor, action);
          }
        }
      });
    }

    if (!discardAction) {
      next(action);
    }
  };
};

function intercept(interceptor: any, action: any) {
  const newPayload = interceptor.callback(action.payload);
  action.payload = newPayload;

  if (newPayload === null) {
    return true; // discard action
  }
  return false;
}
