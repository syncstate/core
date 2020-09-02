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
import { createInterceptMiddleware } from './interceptMiddleware';
import { createObserveMiddleware } from './observeMiddleware';
import get from 'lodash.get';
import useSyncState from './storeMethods/useSyncState';
import { SyncStatePath } from './index';

type ReduxStore = Store<
  CombinedState<{
    [x: string]: any;
  }>,
  any
>;

export default class SyncStateStore {
  reduxStore: ReduxStore;
  dispatch: Dispatch<any>;
  subscribe: (listener: () => void) => Unsubscribe;
  private observeCallbacks: any = [];
  private interceptCallbacks: any = [];

  constructor(
    initialDoc: {},
    docReducer: any,
    topReducer: any,
    plugins?: Array<any>
  ) {
    const initialState = {
      doc: {
        state: initialDoc,
        patches: [],
      },
    };

    const reducers: any = { doc: docReducer };

    if (plugins) {
      plugins.forEach(p => {
        reducers[p.reducer.name] = p.reducer.reducer;
      });
    }
    const combinedReducer: any = combineReducers(reducers);

    function rootReducer(state: any, action: any) {
      const intermediateState = combinedReducer(state, action);
      const finalState = topReducer(intermediateState, action);
      return finalState;
    }
    console.log(reducers, 'reducers');

    const composeEnhancers =
      typeof window === 'object' &&
      process.env.NODE_ENV !== 'production' &&
      (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
        ? (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({
            // Specify extension’s options like name, actionsBlacklist, actionsCreators, serialize...
          })
        : compose;

    let reduxStore: any;
    if (plugins) {
      // @ts-ignore
      reduxStore = createStore(
        topReducer,
        initialState,
        composeEnhancers(
          applyMiddleware(
            createInterceptMiddleware(this.interceptCallbacks),
            createObserveMiddleware(this.observeCallbacks),
            ...plugins.map(p => p.middleware)
          )
        )
      );
    } else {
      reduxStore = createStore(
        topReducer,
        initialState,
        composeEnhancers(
          applyMiddleware(
            createInterceptMiddleware(this.interceptCallbacks),
            createObserveMiddleware(this.observeCallbacks)
          )
        )
      );
    }

    // @ts-ignore
    window['store'] = reduxStore;

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

    console.log(reduxStore.getState());

    this.reduxStore = reduxStore;
    this.dispatch = reduxStore.dispatch;
    this.subscribe = reduxStore.subscribe;
  }
  getState = (subtree: string) => {
    return this.reduxStore.getState()[subtree].state;
  };
  getStateAtPath = (subtree: string, path: SyncStatePath) => {
    const state = this.reduxStore.getState()[subtree].state;
    if (!path || path.length < 1) {
      return state;
    }
    return get(state, path.join('.'));
  };
  observe = (
    subtree: string,
    path: SyncStatePath = [],
    callback: any,
    depth: number = 1
  ) => {
    const newLength = this.observeCallbacks.push({
      subtree,
      path,
      callback,
      depth,
    });
    const observerIndex = newLength - 1;

    return () => {
      this.observeCallbacks.splice(observerIndex, 1);
    };
  };

  intercept = (
    subtree: string,
    path: SyncStatePath = [],
    callback: any,
    depth: number = 1
  ) => {
    const newLength = this.interceptCallbacks.push({
      subtree,
      path,
      callback,
      depth,
    });
    const interceptorIndex = newLength - 1;

    return () => {
      this.interceptCallbacks.splice(interceptorIndex, 1);
    };
  };

  useSyncState = (subtree: string, path: SyncStatePath = []) =>
    useSyncState(this, subtree, path);
  useDoc = (path: SyncStatePath = []) => useSyncState(this, 'doc', path);
}
