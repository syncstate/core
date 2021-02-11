import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { createDocStore } from '../src';
import { useState } from 'react';
import { TodoApp } from './Todo';
import { applyMiddleware } from 'redux';
import history from '@syncstate/history';
import { Provider, useDoc } from '@syncstate/react';
import * as remote from '@syncstate/remote-client';
// @ts-ignore
import socketIOClient from 'socket.io-client';

const store = createDocStore({ todos: [], options: { filter: 'all' } }, [
  history.createInitializer(),
  remote.createInitializer(),
]);

store.dispatch(remote.enableRemote('/todos'));
store.dispatch(remote.enableRemote('/options'));

const socket = socketIOClient('http://localhost:3010', {
  timeout: 100000,
});

store.observe('remote', '/paths/::todos/loading', (loading, change) => {
  console.log('store.observe: remote status changed: ', loading);
});

remote.observeStatus(store, '/todos', loading => {
  console.log('remote.observeStatus: remote status changed: ', loading);
});

socket.emit('fetchDoc', '/todos');
socket.emit('fetchDoc', '/options');
store.dispatch(remote.setLoading('/todos', true));
store.dispatch(remote.setLoading('/options', true));
console.log('Wewdwd', remote.getLoading(store, '/todos'));

socket.on('loaded', path => {
  store.dispatch(remote.setLoading(path, false));
  console.log('Wewdwd', remote.getLoading(store, path));
});

socket.on('change', (path, patch) => {
  console.log('Applying remote patch', patch);
  store.dispatch(remote.applyRemote(path, patch));
});

// store.intercept(
//   'doc',
//   '/todos',
//   (todos, change) => {
//     if (!change.origin && !remote.getLoading(store, '/todos')) {
//       // Don't emit for patches received from server
//       socket.emit('change', '/todos', change);
//     }
//     return change;
//     // return null;
//   },
//   Infinity
// );

remote.onChange(store, '/todos', change => {
  console.log(change, 'remote change ready todos');
  socket.emit('change', '/todos', change);
});

remote.onChange(store, '/options', change => {
  console.log(change, 'remote change ready filter');
  socket.emit('change', '/options', change);
});

const [doc, setDoc] = store.useSyncState('doc');
setDoc(doc => {
  doc.test = {};
  doc.test['/test3/test4/test5'] = 'paihwdih';
});
// const [test, setTest] = store.useDoc('/test');
// setTest('kkkkkk');
store.observe(
  'doc',
  '/test',
  val => {
    console.log('rerererererer &*(&(&&*(');
  },
  1
);

setTimeout(() => {
  setDoc(doc => (doc.test['/test3/test4/test5'] = 'KKKkkkkkk'));
}, 2000);
// undoable(() => true);

const disposeCompute = store.computeDoc((getValue, change) => {
  const todos = getValue('/todos');

  // const [val, setVal] = store.useDoc("path/to/nested/data")
  console.log('$$$computed todos.length', todos.length, 'change', change);
});

setTimeout(() => {
  disposeCompute();
}, 5000);

console.log(store.getPatches('doc'));

const disposeObs = store.observe(
  'doc',
  '/todos',
  (todos, change) => {
    console.log('patch generated at todos path');
    console.log('patch, inversePatch', change.patch, change.inversePatch);
  },
  1
);

const disposeInt = store.intercept(
  'doc',
  '/todos',
  (todos, change) => {
    console.log('patch intercepted at todos path');
    console.log('patch, inversePatch', change.patch, change.inversePatch);
    if (change.patch.path === '/todos/0' && change.patch.op === 'add') {
      return {
        ...change,
        patch: {
          ...change.patch,
          value: { caption: 'Hello', completed: change.patch.value.completed },
        },
      };
    }

    return change;
  },
  1
);

// setTimeout(() => {
//   disposeObs();
//   disposeInt();
// }, 10000);

const App = () => {
  return (
    <div>
      <TodoApp />
    </div>
  );
};

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root')
);
