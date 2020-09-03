import produce from 'immer';
import { DocStore, SyncStatePath } from '../index';
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

// const loadStartCallbacks: any = {};
// const loadEndCallbacks: any = {};

// export function onLoadStart(store: DocStore, path: SyncStatePath, cb: any) {
//   const stringPath = path.join('/');
//   if (loadStartCallbacks[stringPath]) {
//     loadStartCallbacks[stringPath].push(cb);
//   } else {
//     loadStartCallbacks[stringPath] = [cb];
//   }
// }

// export function onLoadEnd(store: DocStore, path: SyncStatePath, cb: any) {
//   const stringPath = path.join('/');
//   if (loadEndCallbacks[stringPath]) {
//     loadEndCallbacks[stringPath].push(cb);
//   } else {
//     loadEndCallbacks[stringPath] = [cb];
//   }
// }

export function getLoading(store: DocStore, path: SyncStatePath) {
  const remoteForPath = store.getState('remote').paths[path.join('/')];
  return remoteForPath ? remoteForPath.loading : false;
}

export function observeStatus(
  store: DocStore,
  path: SyncStatePath,
  callback: any
) {
  return store.observe(
    'remote',
    ['paths', path.join('/'), 'loading'],
    (loading: any, change: any) => {
      callback(loading);
    }
  );
}

export const createInitializer = (pluginName: string = 'remote') => (
  store: DocStore
) => {
  return {
    name: pluginName,
    initialState: {
      paths: {},
    },
    // @ts-ignore
    middleware: reduxStore => next => action => {
      const result = next(action);
      const [remote, setRemote] = store.useSyncState('remote', ['paths']);

      switch (action.type) {
        case 'ENABLE_REMOTE':
          {
            setRemote((remote: any) => {
              action.payload.forEach((path: SyncStatePath) => {
                const stringPath = path.join('/');

                if (!remote[stringPath]) {
                  remote[stringPath] = {
                    loading: false,
                    tempPatches: [],
                  };
                }
              });
            });
          }
          break;

        case 'SET_LOADING_REMOTE':
          {
            setRemote((remote: any) => {
              const stringPath = action.payload.path.join('/');
              if (remote[stringPath]) {
                remote[stringPath].loading = action.payload.value;
              }
            });
          }
          break;

        case 'APPLY_REMOTE':
          {
            store.dispatch({
              type: 'PATCH',
              payload: {
                ...action.payload.change,
                patchType: 'NO_RECORD',
                subtree: 'doc',
              },
            });
          }

          break;
        default:
      }

      return result;
    },
  };
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
