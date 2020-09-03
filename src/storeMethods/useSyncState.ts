import { produceWithPatches } from 'immer';
import DocStore from '../DocStore';
import { SyncStatePath } from '../index';

export default function useSyncState(
  store: DocStore,
  subtree: string,
  path: SyncStatePath
) {
  let stateAtPath = store.getStateAtPath(subtree, path);

  return [
    stateAtPath,
    (callbackOrData: any) => {
      let replaceValue = false;
      if (typeof callbackOrData !== 'function') {
        // throw new Error(
        //   'Received an object. Expecting a callback function which receives the object you want to modify.'
        // );
        replaceValue = true;
      }

      let produceCallback = (draft: any) => {
        callbackOrData(draft);
      };

      if (replaceValue) {
        // replace the received value in its parent
        // let parentPath = [...path];
        const childKey = path.pop();
        stateAtPath = store.getStateAtPath(subtree, path);
        produceCallback = (draft: any) => {
          if (childKey) {
            draft[childKey] = callbackOrData;
          } else {
            // if root path
            throw new Error('Cannot replace root doc');
          }
        };
      }
      // @ts-ignore
      let [nextState, patches, inversePatches] = produceWithPatches(
        stateAtPath,
        produceCallback
      );
      // console.log(path, 'path');
      // console.log(JSON.stringify(patches, null, 2), 'patches before');
      patches = patches.map((p: any) => {
        return { ...p, path: [...path, ...p.path] };
      });

      inversePatches = inversePatches.map((p: any) => {
        return { ...p, path: [...path, ...p.path] };
      });
      // console.log(JSON.stringify(patches, null, 2), 'patches');

      patches.forEach((patch: any, index: number) => {
        store.dispatch({
          type: 'PATCH',
          payload: { patch, inversePatch: inversePatches[index], subtree },
        });
      });

      // store.dispatch({
      //   type: 'PATCHES',
      //   payload: patches.map((patch: any, index: number) => ({
      //     patch: patch,
      //     inversePatch: inversePatches[index],
      //   })),
      // });
    },
    store.dispatch,
  ];
}
