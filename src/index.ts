import { applyPatches, produceWithPatches, enablePatches } from 'immer';

import DocStore from './DocStore';
enablePatches();

function docReducer(
  state: {
    docState: any;
    docPatches: [];
    loaded: boolean;
  } = {
    docState: {},
    docPatches: [],
    loaded: false,
  },
  action: any
) {
  switch (action.type) {
    case 'PATCH':
      return {
        ...state,
        docState: applyPatches(
          state.docState,
          // action payload contains a single patch
          [action.payload.patch]
        ),
        docPatches: [
          ...state.docPatches,
          {
            patch: action.payload.patch,
            inversePatch: action.payload.inversePatch,
          },
        ],
      };

    case 'SET_LOADED':
      return {
        ...state,
        loaded: action.payload,
      };
    default:
      return state;
  }
}

export function createDocStore(initialDoc: {}, plugins?: Array<any>) {
  const docStore = new DocStore(initialDoc, docReducer, plugins);

  return docStore;
}
