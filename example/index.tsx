import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { createDocStore } from '../src';
import { useState } from 'react';
import { TodoApp } from './Todo';
import { applyMiddleware } from 'redux';
import history from '@syncstate/history';
import { Provider, useDoc } from '@syncstate/react';
import * as remote from '../src/remote';
// @ts-ignore
import socketIOClient from 'socket.io-client';

const store = createDocStore({ todos: [], filter: 'all' }, [
  // history.createInitializer(),
  // // remote.createInitializer(),
  // // history.createPlugin({ name: 'history' }),
  // remote.createInitializer(),
]);

// store.dispatch(remote.enableRemote('/todos'));

// const socket = socketIOClient('http://localhost:3001', {
//   timeout: 100000,
// });

// store.observe('remote', '/paths/todos/loading', (loading, change) => {
//   console.log('store.observe: remote status changed: ', loading);
// });

// remote.observeStatus(store, '/todos', loading => {
//   console.log('remote.observeStatus: remote status changed: ', loading);
// });

// socket.emit('fetchDoc', '/todos');
// store.dispatch(remote.setLoading('/todos', true));
// console.log('Wewdwd', remote.getLoading(store, '/todos'));

// socket.on('loaded', path => {
//   store.dispatch(remote.setLoading(path, false));
//   console.log('Wewdwd', remote.getLoading(store, path));
// });

// socket.on('change', (path, patch) => {
//   store.dispatch(remote.applyRemote(path, patch));
// });

// store.intercept(
//   'doc',
//   '/todos',
//   (todos, change) => {
//     if (!change.origin) {
//       // Don't emit for patches received from server
//       socket.emit('change', '/todos', change);
//     }
//     return change;
//     // return null;
//   },
//   Infinity
// );

// remote.onLoadStart(store, "/todos", () => {
//   console.log('started loading todos');
// });

// const [loading, setLoading] = useRootDoc(["remote", "todos/0", "loading"])

// useRemoteStatus(["todos", 0])

// store.rootObserve(["remote", "todos/0", "loading"])

// remote.observeStatus(["todos", 0], () => {

// })

// remote.onLoadEnd(store, "/todos", () => {
//   console.log('ended loading todos');
// });

const [doc, setDoc] = store.useSyncState('doc');
setDoc(doc => (doc.test = 'paihwdih'));
const [test, setTest] = store.useDoc('/test');
setTest('kkkkkk');
// undoable(() => true);

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
          value: { caption: 'Hello', completed: false },
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
