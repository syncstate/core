import {
  produce,
  applyPatches,
  produceWithPatches,
  enablePatches,
} from 'immer';

import DocStore from './DocStore';
import jsonPatchPathToImmerPath from './utils/jsonPatchPathToImmerPath';
enablePatches();

function topReducer(state: any, action: any) {
  switch (action.type) {
    case 'PATCH': {
      return produce(state, (draftState: any) => {
        const patch = {
          ...action.payload.patch,
          path: jsonPatchPathToImmerPath(action.payload.patch.path),
        };
        draftState[action.payload.subtree].state = applyPatches(
          draftState[action.payload.subtree].state,
          [patch]
        );
        draftState[action.payload.subtree].patches.push({
          patch: action.payload.patch,
          inversePatch: action.payload.inversePatch,
        });
      });
    }

    case 'CREATE_SUBTREE': {
      return produce(state, (draftState: any) => {
        draftState[action.payload.subtree] = {
          state: action.payload.initialState,
          patches: [],
        };
      });
    }

    default:
      return state;
  }
}

export function createDocStore(initialDoc: {}, plugins?: Array<any>) {
  const docStore = new DocStore(initialDoc, topReducer, plugins);

  return docStore;
}

export type SyncStatePath = Array<string | number>;
export { DocStore };
