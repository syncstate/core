import { applyPatches, produceWithPatches, enablePatches } from 'immer';

import DocStore from './DocStore';
enablePatches();

export function docReducer(
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
    case 'PATCHES':
      return {
        ...state,
        docState: applyPatches(
          state.docState,
          // action payload should look like this [{patch:{...}, inversePatch:{...}}]
          action.payload.map((patchObj: any) => patchObj.patch)
        ),
        docPatches: [...state.docPatches, ...action.payload],
      };

    case 'SINGLE_PATCH':
      return {
        ...state,
        docState: applyPatches(
          state.docState,
          // action payload contains a single patch
          [action.payload]
        ),
        docPatches: [...state.docPatches, action.payload],
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
