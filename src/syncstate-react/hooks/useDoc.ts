import { useEffect, useState, useContext } from 'react';
import SyncStateReactContext from '../components/Context';
import { produceWithPatches, enablePatches } from 'immer';
enablePatches();

//create your forceUpdate hook
function useForceUpdate() {
  const [value, setValue] = useState(0); // integer state
  return () => setValue(value => ++value); // update the state to force render
}

export function useDoc(path: Array<string | number> = []) {
  const forceUpdate = useForceUpdate();
  const doc: any = useContext(SyncStateReactContext);

  useEffect(() => {
    doc.onPatchPattern(path, () => forceUpdate());
  }, []);
  // console.log(path, doc.getStateAtPath(path), 'doc.getStateAtPath(path)');

  const stateAtPath = doc.getStateAtPath(path);

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

      doc.dispatch({
        type: 'PATCHES',
        payload: patches.map((patch: any, index: number) => ({
          patch: patch,
          inversePatch: inversePatches[index],
        })),
      });
    },
    doc.dispatch,
  ];
}
