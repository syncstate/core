import { produceWithPatches } from 'immer';

export default function setDoc(docStore: any, cb: any) {
  if (typeof cb !== 'function') {
    throw new Error(
      'Received an object. Expecting a callback function which receives the object you want to modify.'
    );
  }

  console.log(docStore.getState(), 'docStore.getState()');
  // @ts-ignore
  let [nextState, patches, inversePatches] = produceWithPatches(
    docStore.getState().doc.docState,
    (draft: any) => {
      cb(draft);
    }
  );

  docStore.dispatch({
    type: 'PATCHES',
    payload: patches.map((patch: any, index: number) => ({
      patch: patch,
      inversePatch: inversePatches[index],
    })),
  });
}
