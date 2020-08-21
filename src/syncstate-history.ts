import produce from 'immer';

export const undo = () => {
  return {
    type: 'UNDO',
    payload: { path: [''] },
  };
};

export const redo = () => {
  return {
    type: 'REDO',
    payload: { path: [''] },
  };
};

export const undoPath = (path: Array<string | number>) => {
  return {
    type: 'UNDO',
    payload: { path: path },
  };
};
export const redoPath = (path: Array<string | number>) => {
  return {
    type: 'REDO',
    payload: { path: path },
  };
};

export const undoTillBreakpoint = () => {
  return {
    type: 'UNDO_TILL_BREAKPOINT',
    payload: { path: [''] },
  };
};

export const redoTillBreakpoint = () => {
  return {
    type: 'REDO_TILL_BREAKPOINT',
    payload: { path: [''] },
  };
};

export const undoPathTillBreakpoint = (path: Array<string | number>) => {
  return {
    type: 'UNDO_TILL_BREAKPOINT',
    payload: { path: path },
  };
};
export const redoPathTillBreakpoint = (path: Array<string | number>) => {
  return {
    type: 'REDO_TILL_BREAKPOINT',
    payload: { path: path },
  };
};

export const insertUndoBreakpoint = (path: Array<string | number> = []) => {
  return {
    type: 'INSERT_UNDO_BREAKPOINT',
    payload: { path: path },
  };
};

export const watchPath = (path: Array<string | number>) => {
  return {
    type: 'WATCH_PATH',
    payload: {
      path,
    },
  };
};

export const unwatchPath = (path: Array<string | number>) => {
  return {
    type: 'UNWATCH_PATH',
    payload: {
      path,
    },
  };
};

export const getUndoablePath = (store: any, path: Array<string | number>) => {
  let undoablePath = '';

  const undoablePaths = store.getState().history.undoablePaths;

  undoablePaths.forEach((p: string) => {
    if (path.join('/').startsWith(p) && path.join('/') !== p) {
      undoablePath = p;
    }
  });

  return undoablePath;
};

export const plugin = {
  middleware: (store: any) => (next: any) => (action: any) => {
    const state = store.getState();

    switch (action.type) {
      case 'PATCHES':
        {
          action.payload.forEach((patchObj: any) => {
            const undoablePath = getUndoablePath(store, patchObj.patch.path);
            if (undoablePath !== undefined) {
              store.dispatch({
                type: 'ADD_UNDO_PATCH',
                payload: { patchObj, undoablePath },
              });
            }
          });
        }
        break;
      case 'INSERT_UNDO_BREAKPOINT':
        {
          store.dispatch({
            type: 'ADD_UNDO_PATCH',
            payload: {
              patchObj: { type: 'breakpoint' },
              undoablePath: action.payload.path.join('/'),
            },
          });
        }
        break;
      case 'UNDO_TILL_BREAKPOINT':
        {
          if (
            !state.history.paths[action.payload.path.join('/')].undo ||
            state.history.paths[action.payload.path.join('/')].undo.length < 1
          ) {
            return;
          }

          const lastUndoPatch = () => {
            const patchArray = store.getState().history.paths[
              action.payload.path.join('/')
            ].undo;
            return patchArray ? patchArray[patchArray.length - 1] : undefined;
          };

          while (lastUndoPatch() && lastUndoPatch().type !== 'breakpoint') {
            const undoPatchObj = lastUndoPatch();
            store.dispatch({
              type: 'POP_UNDO_PATCH',
              payload: {
                undoablePath: action.payload.path.join('/'),
              },
            });
            store.dispatch({
              type: 'SINGLE_PATCH',
              payload: undoPatchObj.inversePatch,
            });

            store.dispatch({
              type: 'ADD_REDO_PATCH',
              payload: {
                patchObj: undoPatchObj,
                undoablePath: action.payload.path.join('/'),
              },
            });
          }

          // checkpoint patch

          if (lastUndoPatch() && lastUndoPatch().type === 'breakpoint') {
            store.dispatch({
              type: 'POP_UNDO_PATCH',
              payload: {
                undoablePath: action.payload.path.join('/'),
              },
            });

            store.dispatch({
              type: 'ADD_REDO_PATCH',
              payload: {
                patchObj: lastUndoPatch(),
                undoablePath: action.payload.path.join('/'),
              },
            });
          }
        }
        break;
      case 'UNDO':
        {
          if (
            !state.history.paths[action.payload.path.join('/')].undo ||
            state.history.paths[action.payload.path.join('/')].undo.length < 1
          ) {
            return;
          }

          const lastUndoPatch = () => {
            const patchArray = store.getState().history.paths[
              action.payload.path.join('/')
            ].undo;
            return patchArray ? patchArray[patchArray.length - 1] : undefined;
          };

          while (lastUndoPatch() && lastUndoPatch().type === 'breakpoint') {
            store.dispatch({
              type: 'POP_UNDO_PATCH',
              payload: {
                undoablePath: action.payload.path.join('/'),
              },
            });

            store.dispatch({
              type: 'ADD_REDO_PATCH',
              payload: {
                patchObj: lastUndoPatch(),
                undoablePath: action.payload.path.join('/'),
              },
            });
          }

          const undoPatchObj = lastUndoPatch();
          if (!undoPatchObj) {
            break;
          }
          store.dispatch({
            type: 'POP_UNDO_PATCH',
            payload: {
              undoablePath: action.payload.path.join('/'),
            },
          });
          store.dispatch({
            type: 'SINGLE_PATCH',
            payload: undoPatchObj.inversePatch,
          });

          store.dispatch({
            type: 'ADD_REDO_PATCH',
            payload: {
              patchObj: undoPatchObj,
              undoablePath: action.payload.path.join('/'),
            },
          });
        }
        break;
      case 'REDO_TILL_BREAKPOINT':
        {
          if (
            !state.history.paths[action.payload.path.join('/')].redo ||
            state.history.paths[action.payload.path.join('/')].redo.length < 1
          ) {
            return;
          }

          const lastRedoPatch = () => {
            const patchArray = store.getState().history.paths[
              action.payload.path.join('/')
            ].redo;
            return patchArray ? patchArray[patchArray.length - 1] : undefined;
          };

          while (lastRedoPatch() && lastRedoPatch().type !== 'breakpoint') {
            const redoPatchObj = lastRedoPatch();

            store.dispatch({
              type: 'POP_REDO_PATCH',
              payload: {
                undoablePath: action.payload.path.join('/'),
              },
            });
            store.dispatch({
              type: 'SINGLE_PATCH',
              payload: redoPatchObj.patch,
            });

            store.dispatch({
              type: 'ADD_UNDO_PATCH',
              payload: {
                patchObj: redoPatchObj,
                undoablePath: action.payload.path.join('/'),
              },
            });
          }

          if (lastRedoPatch() && lastRedoPatch().type === 'breakpoint') {
            store.dispatch({
              type: 'POP_REDO_PATCH',
              payload: {
                undoablePath: action.payload.path.join('/'),
              },
            });

            store.dispatch({
              type: 'ADD_UNDO_PATCH',
              payload: {
                patchObj: lastRedoPatch(),
                undoablePath: action.payload.path.join('/'),
              },
            });
          }
        }
        break;
      case 'REDO':
        {
          if (
            !state.history.paths[action.payload.path.join('/')].redo ||
            state.history.paths[action.payload.path.join('/')].redo.length < 1
          ) {
            return;
          }

          const lastRedoPatch = () => {
            const patchArray = store.getState().history.paths[
              action.payload.path.join('/')
            ].redo;
            return patchArray ? patchArray[patchArray.length - 1] : undefined;
          };

          while (lastRedoPatch() && lastRedoPatch().type === 'breakpoint') {
            store.dispatch({
              type: 'POP_REDO_PATCH',
              payload: {
                undoablePath: action.payload.path.join('/'),
              },
            });

            store.dispatch({
              type: 'ADD_UNDO_PATCH',
              payload: {
                patchObj: lastRedoPatch(),
                undoablePath: action.payload.path.join('/'),
              },
            });
          }

          const redoPatchObj = lastRedoPatch();
          if (!redoPatchObj) {
            break;
          }

          store.dispatch({
            type: 'POP_REDO_PATCH',
            payload: {
              undoablePath: action.payload.path.join('/'),
            },
          });
          store.dispatch({
            type: 'SINGLE_PATCH',
            payload: redoPatchObj.patch,
          });

          store.dispatch({
            type: 'ADD_UNDO_PATCH',
            payload: {
              patchObj: redoPatchObj,
              undoablePath: action.payload.path.join('/'),
            },
          });
        }
        break;
    }

    let result = next(action);
    // if (
    //   (action.type === 'PATCHES' || action.type === 'SINGLE_PATCH') &&
    //   store.getState().loaded
    // ) {
    //   store.getState().socket.emit('patches', action.payload);
    // }

    // @ts-ignore
    window['undoPatches'] = store.getState().history.paths;
    // @ts-ignore
    window['redoPatches'] = store.getState().history.paths;

    return result;
  },
  reducer: {
    name: 'history',
    reducer: historyReducer,
  },
};

export function historyReducer(
  state: {
    paths: {
      [key: string]: {
        undo: any[];
        redo: any[];
      };
    };
    undoablePaths: Array<string>;
  } = {
    paths: {
      '': {
        undo: [],
        redo: [],
      },
    },
    undoablePaths: [],
  },
  action: any
) {
  switch (action.type) {
    case 'ADD_UNDO_PATCH':
      return produce(state, draftState => {
        if (!draftState.paths[action.payload.undoablePath]) {
          draftState.paths[action.payload.undoablePath] = {
            undo: [],
            redo: [],
          };
        }
        draftState.paths[action.payload.undoablePath].undo.push(
          action.payload.patchObj
        );
      });

    case 'ADD_REDO_PATCH':
      return produce(state, draftState => {
        if (!draftState.paths[action.payload.undoablePath]) {
          draftState.paths[action.payload.undoablePath] = {
            undo: [],
            redo: [],
          };
        }
        draftState.paths[action.payload.undoablePath].redo.push(
          action.payload.patchObj
        );
      });
    case 'POP_UNDO_PATCH':
      return produce(state, draftState => {
        if (draftState.paths[action.payload.undoablePath].undo) {
          draftState.paths[action.payload.undoablePath].undo.pop();
        }
      });
    case 'POP_REDO_PATCH':
      return produce(state, draftState => {
        if (!draftState.paths[action.payload.undoablePath].redo) {
          draftState.paths[action.payload.undoablePath].redo.pop();
        }
      });

    case 'WATCH_PATH':
      return produce(state, draftState => {
        if (!draftState.undoablePaths.includes(action.payload.path.join('/'))) {
          draftState.undoablePaths.push(action.payload.path.join('/'));
        }
      });
    case 'UNWATCH_PATH':
      return produce(state, draftState => {
        draftState.undoablePaths.forEach((p, index) => {
          if (p === action.payload.path.join('/')) {
            draftState.undoablePaths.splice(index, 1);
          }
        });
      });

    default:
      return state;
  }
}
