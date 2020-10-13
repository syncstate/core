import get from 'lodash.get';
import immerPathToJsonPatchPath from './utils/immerPathToJsonPatchPath';
import jsonPatchPathToImmerPath from './utils/jsonPatchPathToImmerPath';

export type Observer = {
  subtree: string;
  path: string;
  callback: (value: any, change: any) => void;
  depth: number;
};

export const createObserveMiddleware = (observers: Map<number, Observer>) => {
  return (store: any) => (next: any) => (action: any) => {
    const result = next(action);

    if (action.type === 'PATCH') {
      observers.forEach((observer, key) => {
        const payloadPath = action.payload.patch.path;

        if (observer.subtree !== action.payload.subtree || observer.depth < 0) {
          // Skip this observer if observer and action.payload subtrees do not match
          return;
        }

        // If path above the observer path changes call observer for all cases
        if (observer.path.startsWith(payloadPath)) {
          callObserver(observer, store, action);
        }

        // If depth x, call for x levels extra below observer path
        else if (observer.depth > 0 && observer.depth !== Infinity) {
          const matchingLengthPayloadPathArray = jsonPatchPathToImmerPath(
            payloadPath
          ).slice(0, jsonPatchPathToImmerPath(observer.path).length);
          const remainingPayloadPathLength =
            jsonPatchPathToImmerPath(payloadPath).length -
            matchingLengthPayloadPathArray.length;

          if (
            immerPathToJsonPatchPath(matchingLengthPayloadPathArray) ===
              observer.path &&
            remainingPayloadPathLength <= observer.depth
          ) {
            callObserver(observer, store, action);
          }
        }

        //If depth is infinity, call for any number of levels below observer path
        else if (observer.depth === Infinity) {
          if (payloadPath.startsWith(observer.path)) {
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
    get(
      store.getState()[observer.subtree],
      'state' + observer.path.replaceAll('/', '.')
    ),
    action.payload
  );
}
