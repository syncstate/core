import { applyOperation } from 'fast-json-patch';

export const syncstateHistory = (store: any) => (next: any) => (
  action: any
) => {
  const state = store.getState();

  if (action.type === 'PATCH') {
    // if (!state.undoPatches) {
    //   state.undoPatches = [];
    // }
    // if (!state.redoPatches) {
    //   state.redoPatches = [];
    // }

    store.dispatch({
      type: 'ADD_UNDO_PATCH',
      payload: {
        reverse: getReversePatch(state.docState, action.payload),
        forward: action.payload,
      },
    });
    // state.undoPatches.push({
    //   reverse: getReversePatch(state.docState, action.payload),
    //   forward: action.payload,
    // });
  } else if (action.type === 'UNDO') {
    if (state.undoPatches && state.undoPatches.length > 0) {
      const undoOperation = state.undoPatches[state.undoPatches.length - 1];
      store.dispatch({
        type: 'POP_UNDO_PATCH',
      });
      store.dispatch({
        type: 'PATCH_HISTORY',
        payload: undoOperation.reverse,
      });

      store.dispatch({
        type: 'ADD_REDO_PATCH',
        payload: undoOperation,
      });
      // state.redoPatches.push(undoOperation);
    }
  } else if (action.type === 'REDO') {
    if (state.redoPatches && state.redoPatches.length > 0) {
      const redoOperation = state.redoPatches[state.redoPatches.length - 1];
      store.dispatch({
        type: 'POP_REDO_PATCH',
      });
      store.dispatch({
        type: 'PATCH_HISTORY',
        payload: redoOperation.forward,
      });

      store.dispatch({
        type: 'ADD_UNDO_PATCH',
        payload: redoOperation,
      });
      // state.undoPatches.push(redoOperation);
    }
  }

  let result = next(action);

  // @ts-ignore
  window['undoPatches'] = store.getState().undoPatches;
  // @ts-ignore
  window['redoPatches'] = store.getState().redoPatches;

  return result;
};

function getReversePatch(object: any, patch: any) {
  const patchInfo: any = applyOperation(object, patch, true, false);

  const reversePatch: any = {};
  if (patch.op === 'add') {
    reversePatch.op = 'remove';
    reversePatch.path = patch.path;

    if (patch.path.endsWith('/-')) {
      reversePatch.path = patch.path.replace(/\/\-$/, '/' + patchInfo.index);
    }
  } else if (patch.op === 'replace') {
    reversePatch.op = 'replace';
    reversePatch.path = patch.path;
    reversePatch.value = patchInfo.removed;
  } else if (patch.op === 'remove') {
    reversePatch.op = 'add';
    reversePatch.path = patch.path;
    reversePatch.value = patchInfo.removed;
  } else if (patch.op === 'move') {
    reversePatch.op = 'move';
    reversePatch.from = patch.path;
    reversePatch.path = patch.from;
  }

  return reversePatch;
}
