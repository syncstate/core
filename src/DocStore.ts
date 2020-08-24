import {
  Store,
  CombinedState,
  Dispatch,
  Unsubscribe,
  createStore,
  combineReducers,
  applyMiddleware,
  compose,
} from 'redux';
import { createWatchMiddleware } from './watchMiddleware';
import get from 'lodash.get';
import setDoc from './storeMethods/setDoc';
import useDoc from './storeMethods/useDoc';

type ReduxStore = Store<
  CombinedState<{
    [x: string]: any;
  }>,
  any
>;

export default class DocStore {
  store: ReduxStore;
  dispatch: Dispatch<any>;
  subscribe: (listener: () => void) => Unsubscribe;
  watchCallbacks: any = [];

  constructor(initialDoc: {}, docReducer: any, plugins?: Array<any>) {
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

    if (plugins) {
      plugins.forEach(p => {
        reducers[p.reducer.name] = p.reducer.reducer;
      });
    }
    const rootReducer = combineReducers(reducers);
    console.log(reducers, 'reducers');

    const composeEnhancers =
      typeof window === 'object' &&
      process.env.NODE_ENV !== 'production' &&
      (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
        ? (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({
            // Specify extension’s options like name, actionsBlacklist, actionsCreators, serialize...
          })
        : compose;

    let store: any;
    if (plugins) {
      // @ts-ignore
      store = createStore(
        rootReducer,
        initialState,
        composeEnhancers(
          applyMiddleware(
            ...plugins.map(p => p.middleware),
            createWatchMiddleware(this.watchCallbacks)
          )
        )
      );
    } else {
      store = createStore(
        rootReducer,
        initialState,
        composeEnhancers(
          applyMiddleware(createWatchMiddleware(this.watchCallbacks))
        )
      );
    }

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

    this.store = store;
    this.dispatch = store.dispatch;
    this.subscribe = store.subscribe;
  }
  getState = () => {
    return this.store.getState();
  };
  getStateAtPath = (path: Array<string | number>) => {
    const state = this.store.getState().doc.docState;
    if (!path || path.length < 1) {
      return state;
    }
    return get(state, path.join('.'));
  };
  onPatchPattern = (path: string, cb: any) => {
    const unsubscribe = this.store.subscribe(cb);
    return unsubscribe;
  };
  watchPath = (path: Array<string | number> = [], callback: any) => {
    const newLength = this.watchCallbacks.push({ path, callback });
    const watchIndex = newLength - 1;

    return () => {
      this.watchCallbacks.splice(watchIndex, 1);
    };
  };
  setDoc = (cb: any) => setDoc(this, cb);

  useDoc = (path: Array<string | number> = []) => useDoc(this, path);
}
