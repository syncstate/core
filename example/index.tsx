import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { createDocStore } from '../src';
import { useState } from 'react';
import { TodoApp } from './Todo';
import { applyMiddleware } from 'redux';
import history from '@syncstate/history';
import { Provider } from '@syncstate/react';

const store = createDocStore({ todos: [], filter: 'all' }, [history.plugin]);

const [doc, setDoc] = store.useDoc();
setDoc(doc => (doc.test = 'paihwdih'));
const [test, setTest] = store.useDoc(['test']);
setTest('kkkkkk');
// undoable(() => true);

const disposeObs = store.observe(
  ['todos'],
  change => {
    console.log('patch generated at todos path');
    console.log('patch, inversePatch', change.patch, change.inversePatch);
  },
  1
);

const disposeInt = store.intercept(
  ['todos'],
  change => {
    console.log('patch intercepted at todos path');
    console.log('patch, inversePatch', change.patch, change.inversePatch);
    if (
      change.patch.path.join('/') === 'todos/0' &&
      change.patch.op === 'add'
    ) {
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

setTimeout(() => {
  disposeObs();
  disposeInt();
}, 10000);

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
