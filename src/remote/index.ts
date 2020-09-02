import produce from 'immer';
import { SyncStateStore, SyncStatePath } from '../index';
import { Middleware, Reducer } from 'redux';

export function enableRemote(paths: SyncStatePath | Array<SyncStatePath>) {
  return {
    type: 'ENABLE_REMOTE',
    payload: Array.isArray(paths) && Array.isArray(paths[0]) ? paths : [paths],
  };
}

export function applyRemote(path: SyncStatePath, change: any) {
  return {
    type: 'APPLY_REMOTE',
    payload: { path, change },
  };
}

export function setLoading(path: SyncStatePath, value: boolean) {
  return {
    type: 'SET_LOADING_REMOTE',
    payload: { path, value },
  };
}

const loadStartCallbacks: any = {};
const loadEndCallbacks: any = {};

export function onLoadStart(
  store: SyncStateStore,
  path: SyncStatePath,
  cb: any
) {
  const stringPath = path.join('/');
  if (loadStartCallbacks[stringPath]) {
    loadStartCallbacks[stringPath].push(cb);
  } else {
    loadStartCallbacks[stringPath] = [cb];
  }
}

export function onLoadEnd(store: SyncStateStore, path: SyncStatePath, cb: any) {
  const stringPath = path.join('/');
  if (loadEndCallbacks[stringPath]) {
    loadEndCallbacks[stringPath].push(cb);
  } else {
    loadEndCallbacks[stringPath] = [cb];
  }
}

export function getLoading(store: SyncStateStore, path: SyncStatePath) {
  const remoteForPath = store.reduxStore.getState().remote.paths[
    path.join('/')
  ];
  return remoteForPath ? remoteForPath.loading : false;
}

export const plugin: {
  middleware: Middleware;
  reducer: { name: string; reducer: Reducer };
} = {
  middleware: store => next => action => {
    const result = next(action);

    switch (action.type) {
      case 'SET_LOADING_REMOTE':
        {
          const stringPath = action.payload.path.join('/');
          if (action.payload.value) {
            const callbacks = loadStartCallbacks[stringPath];

            if (callbacks) {
              callbacks.forEach((cb: any) => {
                cb();
              });
            }
          } else {
            const callbacks = loadEndCallbacks[stringPath];

            if (callbacks) {
              callbacks.forEach((cb: any) => {
                cb();
              });
            }
          }
        }
        break;
      case 'APPLY_REMOTE':
        {
          const stringPath = action.payload.path.join('/');

          store.dispatch({
            type: 'PATCH',
            payload: { ...action.payload.change, patchType: 'NO_RECORD' },
          });
        }

        break;
      default:
    }

    return result;
  },
  reducer: {
    name: 'remote',
    reducer: remoteReducer,
  },
};

export function remoteReducer(
  state: {
    paths: {
      [key: string]: {
        loading: boolean;
        tempPatches: Array<any>;
      };
    };
  } = {
    paths: {},
  },
  action: any
) {
  switch (action.type) {
    case 'ENABLE_REMOTE':
      return produce(state, draftState => {
        action.payload.forEach((path: SyncStatePath) => {
          const stringPath = path.join('/');

          if (!draftState.paths[stringPath]) {
            draftState.paths[stringPath] = {
              loading: false,
              tempPatches: [],
            };
          }
        });
      });
      break;

    case 'SET_LOADING_REMOTE':
      return produce(state, draftState => {
        const stringPath = action.payload.path.join('/');
        if (draftState.paths[stringPath]) {
          draftState.paths[stringPath].loading = action.payload.value;
        }
      });
      break;

    default:
      return state;
  }
}
