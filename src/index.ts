import { createStore, StoreEnhancer } from 'redux';
import { applyOperation } from 'fast-json-patch';
import get from 'lodash.get';

export function docReducer(
  state: { docState: any; undoPatches: []; redoPatches: []; docPatches: [] } = {
    docState: {},
    undoPatches: [],
    redoPatches: [],
    docPatches: [],
  },
  action: any
) {
  switch (action.type) {
    case 'PATCH':
      return {
        ...state,
        docState: applyOperation(state.docState, action.payload, true, false)
          .newDocument,
        docPatches: [...state.docPatches, action.payload],
      };
    case 'PATCH_HISTORY':
      return {
        ...state,
        docState: applyOperation(state.docState, action.payload, true, false)
          .newDocument,
        docPatches: [...state.docPatches, action.payload],
      };
    case 'ADD_UNDO_PATCH':
      return {
        ...state,
        undoPatches: [...state.undoPatches, action.payload],
      };
    case 'ADD_REDO_PATCH':
      return {
        ...state,
        redoPatches: [...state.redoPatches, action.payload],
      };
    case 'POP_UNDO_PATCH':
      return {
        ...state,
        undoPatches: [
          ...state.undoPatches.slice(0, state.undoPatches.length - 2),
        ],
      };
    case 'POP_REDO_PATCH':
      return {
        ...state,
        redoPatches: [
          ...state.redoPatches.slice(0, state.redoPatches.length - 2),
        ],
      };
    default:
      return state;
  }
}

export function createDoc(initialDoc: {}, enhancer?: StoreEnhancer) {
  const initialState = {
    docState: initialDoc,
    undoPatches: [],
    redoPatches: [],
    docPatches: [],
  };
  // @ts-ignore
  const store = createStore(docReducer, initialState, enhancer);

  return {
    store,
    getState: () => {
      return store.getState();
    },
    dispatch: store.dispatch,
    subscribe: store.subscribe,
    getStateAtPath: (path: string) => {
      return get(
        store.getState().docState,
        path
          .replace('/', '') // remove first slash
          .replace(/\//g, '.')
      );
    },
    onPatchPattern: (path: string, cb: any) => {
      store.subscribe(cb);
    },
  };
}

export * from './syncstate-react';
export * from './syncstate-history';
