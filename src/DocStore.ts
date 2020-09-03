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
  private observers: Array<Observer> = [];
  private interceptors: Array<Interceptor> = [];

  constructor(
    initialDoc: {},
    topReducer: any,
    pluginCreators: Array<any> = []
  ) {
    // @ts-ignore
    window['store'] = this;

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
  observe = (
    subtree: string,
    path: string = '',
    callback: any,
    depth: number = 1
  ) => {
    const newLength = this.observers.push({
      subtree,
      path,
      callback,
      depth,
    });
    const observerIndex = newLength - 1;

    return () => {
      this.observers.splice(observerIndex, 1);
    };
  };

  intercept = (
    subtree: string,
    path: string = '',
    callback: any,
    depth: number = 1
  ) => {
    const newLength = this.interceptors.push({
      subtree,
      path,
      callback,
      depth,
    });
    const interceptorIndex = newLength - 1;

    return () => {
      this.interceptors.splice(interceptorIndex, 1);
    };
  };

  useSyncState = (subtree: string, path: string = '') =>
    useSyncState(this, subtree, path);
  useDoc = (path: string = '') => useSyncState(this, 'doc', path);
}
