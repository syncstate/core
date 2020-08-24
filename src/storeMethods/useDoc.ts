import { produceWithPatches } from 'immer';

export default function useDoc(store: any, path: Array<string | number>) {
  const stateAtPath = store.getStateAtPath(path);

  return [
    stateAtPath,
    (cb: any) => {
      if (typeof cb !== 'function') {
        throw new Error(
          'Received an object. Expecting a callback function which receives the object you want to modify.'
        );
      }

      // @ts-ignore
      let [nextState, patches, inversePatches] = produceWithPatches(
        stateAtPath,
        (draft: any) => {
          cb(draft);
        }
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

      store.dispatch({
        type: 'PATCHES',
        payload: patches.map((patch: any, index: number) => ({
          patch: patch,
          inversePatch: inversePatches[index],
        })),
      });
    },
    store.dispatch,
  ];
}
