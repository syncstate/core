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
import useDoc from './storeMethods/useDoc';

type ReduxStore = Store<
  CombinedState<{
    [x: string]: any;
  }>,
  any
>;

export default class DocStore {
  reduxStore: ReduxStore;
  dispatch: Dispatch<any>;
  subscribe: (listener: () => void) => Unsubscribe;
  private observeCallbacks: any = [];
  private interceptCallbacks: any = [];

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

    let reduxStore: any;
    if (plugins) {
      // @ts-ignore
      reduxStore = createStore(
        rootReducer,
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
        rootReducer,
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
  getState = () => {
    return this.reduxStore.getState();
  };
  getStateAtPath = (path: Array<string | number>) => {
    const state = this.reduxStore.getState().doc.docState;
    if (!path || path.length < 1) {
      return state;
    }
    return get(state, path.join('.'));
  };
  observe = (
    path: Array<string | number> = [],
    callback: any,
    depth: number = 1
  ) => {
    const newLength = this.observeCallbacks.push({ path, callback, depth });
    const observerIndex = newLength - 1;

    return () => {
      this.observeCallbacks.splice(observerIndex, 1);
    };
  };

  intercept = (
    path: Array<string | number> = [],
    callback: any,
    depth: number = 1
  ) => {
    const newLength = this.interceptCallbacks.push({ path, callback, depth });
    const interceptorIndex = newLength - 1;

    return () => {
      this.interceptCallbacks.splice(interceptorIndex, 1);
    };
  };

  useDoc = (path: Array<string | number> = [], depth: number = 1) =>
    useDoc(this, path, depth);
}
