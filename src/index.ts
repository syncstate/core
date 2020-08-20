import {
  createStore,
  StoreEnhancer,
  combineReducers,
  applyMiddleware,
} from 'redux';
import { applyPatches, produceWithPatches } from 'immer';
import get from 'lodash.get';
import socketIOClient from 'socket.io-client';

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
          // action payload should look like this [{patch:{...}, inversePatch:{...}}]
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

export function createDocStore(initialDoc: {}, plugins: Array<any>) {
  // const socket = socketIOClient('http://localhost:3001', {
  //   timeout: 100000,
  // });

  const initialState = {
    doc: {
      docState: initialDoc,
      docPatches: [],
      loaded: false,
    },
  };

  const reducers: any = { doc: docReducer };

  plugins.forEach(p => {
    reducers[p.reducer.name] = p.reducer.reducer;
  });
  const rootReducer = combineReducers(reducers);
  console.log(reducers, 'reducers');
  // @ts-ignore
  const store: any = createStore(
    rootReducer,
    initialState,
    applyMiddleware(...plugins.map(p => p.middleware))
  );

  // @ts-ignore
  window['store'] = store;

  // socket.on('patches', (patches: any) => {
  //   store.dispatch({
  //     type: 'PATCHES',
  //     payload: patches,
  //   });
  // });
  // socket.on('loaded', (patches: any) => {
  //   store.dispatch({
  //     type: 'SET_LOADED',
  //     payload: true,
  //   });
  // });

  console.log(store.getState());

  return {
    store,
    getState: () => {
      return store.getState();
    },
    dispatch: store.dispatch,
    subscribe: store.subscribe,
    getStateAtPath: (path: Array<string | number>) => {
      const state = store.getState().doc.docState;
      if (!path || path.length < 1) {
        return state;
      }
      return get(state, path.join('.'));
    },
    onPatchPattern: (path: string, cb: any) => {
      store.subscribe(cb);
    },
    // watchPath: (path: Array<string|number> = []) => {

    // },
    setDoc: (cb: any) => {
      if (typeof cb !== 'function') {
        throw new Error(
          'Received an object. Expecting a callback function which receives the object you want to modify.'
        );
      }

      // @ts-ignore
      let [nextState, patches, inversePatches] = produceWithPatches(
        store.getState().doc.docState,
        (draft: any) => {
          cb(draft);
        }
      );

      store.dispatch({
        type: 'PATCHES',
        payload: patches.map((patch: any, index: number) => ({
          patch: patch,
          inversePatch: inversePatches[index],
        })),
      });
    },
  };
}

function watchPath () {

}


export * from './syncstate-react';
export * as history from './syncstate-history';


