import {
  produce,
  applyPatches,
  produceWithPatches,
  enablePatches,
} from 'immer';

import SyncStateStore from './SyncStateStore';
enablePatches();

function docReducer(
  state: {
    state: any;
    patches: [];
  } = {
    state: {},
    patches: [],
  },
  action: any
) {
  switch (action.type) {
    // case 'PATCH':
    //   return state;
    //   return {
    //     ...state,
    //     state: applyPatches(
    //       state.state,
    //       // action payload contains a single patch
    //       [action.payload.patch]
    //     ),
    //     patches: [
    //       ...state.patches,
    //       {
    //         patch: action.payload.patch,
    //         inversePatch: action.payload.inversePatch,
    //       },
    //     ],
    //   };

    default:
      return state;
  }
}

function topReducer(state: any, action: any) {
  switch (action.type) {
    case 'PATCH': {
      return produce(state, (draftState: any) => {
        draftState[action.payload.subtree].state = applyPatches(
          draftState[action.payload.subtree].state,
          [action.payload.patch]
        );
        draftState[action.payload.subtree].patches.push({
          patch: action.payload.patch,
          inversePatch: action.payload.inversePatch,
        });
      });
    }

    default:
      return state;
  }
}

export function createStore(initialDoc: {}, plugins?: Array<any>) {
  const docStore = new SyncStateStore(
    initialDoc,
    docReducer,
    topReducer,
    plugins
  );

  return docStore;
}

export type SyncStatePath = Array<string | number>;
export { SyncStateStore };
