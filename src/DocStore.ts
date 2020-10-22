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
import { createInterceptMiddleware, Interceptor } from './interceptMiddleware';
import { createObserveMiddleware, Observer } from './observeMiddleware';
import get from 'lodash.get';
import useSyncState from './storeMethods/useSyncState';
import { SyncStatePath } from './index';
import removeFirstElement from './utils/jsonPatchPathToImmerPath';
import jsonPatchPathToImmerPath from './utils/jsonPatchPathToImmerPath';
import getNextId from './utils/getNextId';
import { Watch, ComputeCallback } from 'types';
import { createPostObserveMiddleware } from './postObserveMiddleware';
import { createPostInterceptMiddleware } from './postInterceptMiddleware';

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
  plugins: Array<any>;
  private observers = new Map<number, Observer>();
  private interceptors = new Map<number, Interceptor>();
  private postObserveCallbacks: Array<() => void> = [];
  private postInterceptCallbacks: Array<() => void> = [];

  constructor(
    initialDoc: {},
    topReducer: any,
    pluginCreators: Array<any> = []
  ) {
    const initialState = {
      doc: {
        state: initialDoc,
        patches: [],
      },
    };

    const pluginNames: Array<string> = [];
    this.plugins = pluginCreators.map(pluginCreator => {
      const plugin = pluginCreator(this);
      if (pluginNames.find(pName => pName === plugin.name)) {
        throw new Error(`SyncState plugin named ${plugin.name} already exists! You can override plugin name
by passing name in plugin configuration to createPlugin.
        createStore({}, [
          myPlugin.createPlugin({
            name: "myOtherPlugin"
          })
        ])`);
      }

      pluginNames.push(plugin.name);
      return plugin;
    });

    // const reducers: any = {};

    // this.plugins.forEach(p => {
    //   if (p.reducer) {
    //     reducers[p.reducer.name] = p.reducer.reducer;
    //   }
    // });

    // const combinedReducer: any = combineReducers(reducers);

    // function rootReducer(state: any, action: any) {
    //   const intermediateState = combinedReducer(state, action);
    //   const finalState = topReducer(intermediateState, action);
    //   return finalState;
    // }
    // console.log(reducers, 'reducers');

    const composeEnhancers =
      typeof window === 'object' &&
      process.env.NODE_ENV !== 'production' &&
      (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
        ? (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({
            // Specify extension’s options like name, actionsBlacklist, actionsCreators, serialize...
          })
        : compose;

    let reduxStore: any;

    // @ts-ignore
    reduxStore = createStore(
      topReducer,
      initialState,
      composeEnhancers(
        applyMiddleware(
          createInterceptMiddleware(this.interceptors),
          createObserveMiddleware(this.observers),
          createPostInterceptMiddleware(this.postInterceptCallbacks),
          createPostObserveMiddleware(this.postObserveCallbacks),
          ...this.plugins.map(p => p.middleware)
        )
      )
    );

    console.log(reduxStore.getState());

    this.reduxStore = reduxStore;
    this.dispatch = reduxStore.dispatch;
    this.subscribe = reduxStore.subscribe;

    this.plugins.forEach(plugin => {
      this.reduxStore.dispatch({
        type: 'CREATE_SUBTREE',
        payload: {
          subtree: plugin.name,
          initialState: plugin.initialState,
        },
      });
    });

    if (process.env.NODE_ENV !== 'production') {
      // @ts-ignore
      window['store'] = this;
    }
  }
  getState = (subtree: string) => {
    const subtreeState = this.reduxStore.getState()[subtree];
    if (!subtreeState) {
      console.warn(`Tried to access non-existent subtree ${subtree}`);
      return undefined;
    }
    return subtreeState.state;
  };
  getStateAtPath = (subtree: string, path: string) => {
    const subtreeState = this.reduxStore.getState()[subtree];
    if (!subtreeState) {
      console.warn(`Tried to access non-existent subtree ${subtree}`);
      return undefined;
    }

    const state = subtreeState.state;
    if (!path) {
      return state;
    }
    return get(state, jsonPatchPathToImmerPath(path).join('.'));
  };
  getPatches = (subtree: string) => {
    const subtreeState = this.reduxStore.getState()[subtree];
    if (!subtreeState) {
      console.warn(`Tried to access non-existent subtree ${subtree}`);
      return undefined;
    }

    return subtreeState.patches;
  };
  observe = (
    subtree: string,
    path: string = '',
    callback: (value: any, change: any) => void,
    depth: number = 1
  ) => {
    const observerId = getNextId();
    this.postObserve(() => {
      const newLength = this.observers.set(observerId, {
        subtree,
        path,
        callback,
        depth,
      });

      // console.log(
      //   '$$$$added observer with id ',
      //   {
      //     subtree,
      //     path,
      //     callback,
      //     depth,
      //   },
      //   observerId
      // );
    });

    return () => {
      this.observers.delete(observerId);
      // console.log('$$$$$removing observer with id ', observerId);
    };
  };

  intercept = (
    subtree: string,
    path: string = '',
    callback: (value: any, change: any) => any,
    depth: number = 1
  ) => {
    const interceptorId = getNextId();
    this.postIntercept(() => {
      const newLength = this.interceptors.set(interceptorId, {
        subtree,
        path,
        callback,
        depth,
      });
    });

    return () => {
      this.interceptors.delete(interceptorId);
    };
  };

  postObserve = (callback: () => void) => {
    this.postObserveCallbacks.push(callback);
  };
  postIntercept = (callback: () => void) => {
    this.postInterceptCallbacks.push(callback);
  };

  useSyncState = (subtree: string, path: string = '') =>
    useSyncState(this, subtree, path);
  useDoc = (path: string = '') => useSyncState(this, 'doc', path);

  computeDoc = (computeCallback: ComputeCallback) => {
    return this.compute('doc', computeCallback);
  };

  compute = (subtree: string, computeCallback: ComputeCallback) => {
    let oldDispose: any;
    const watch: Watch = (
      watchPath: string,
      depth: number = 1,
      firstWatch: boolean = false
    ) => {
      if (oldDispose) {
        oldDispose();
      }

      if (!firstWatch) {
        this.postObserve(() => {
          // postObserve bcoz otherwise a new observer gets added to the end of the array when calling
          // a previous observer leading to an infinite loop
          // console.log('$$$$compute observer 1');
          const dispose = this.observe(
            subtree,
            watchPath,
            (updatedValue, change) => {
              oldDispose = dispose;
              computeCallback(getValue, change);
            },
            depth
          );
        });
      } else {
        // console.log('$$$$compute observer 2');
        const dispose = this.observe(
          subtree,
          watchPath,
          (updatedValue, change) => {
            oldDispose = dispose;
            computeCallback(getValue, change);
          },
          depth
        );
      }

      // return dispose;
    };

    const getValue = (
      path: string,
      depth: number = 1,
      firstRun: boolean = false
    ) => {
      watch(path, depth, firstRun);
      const [doc, setDoc] = this.useSyncState(subtree, path);
      return doc;
    };

    computeCallback(
      (path: string, depth: number = 1) => getValue(path, depth, true),
      {}
    );

    return () => {
      if (oldDispose) {
        oldDispose();
      }
    };
  };
}
