import 'react-app-polyfill/ie11';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { createDocStore } from '../src';
import { useState } from 'react';
import { TodoApp } from './Todo';
import { applyMiddleware } from 'redux';
import history from '@syncstate/history';
import { Provider } from '@syncstate/react';

const store = createDocStore({ todos: [], filter: 'all' }, [history.plugin]);

store.setDoc(doc => {
  doc.test = 'Awdwdwdd';
});
// undoable(() => true);

const unwatch = store.watchPath(['todos'], ({ patch, inversePatch }) => {
  console.log('patch generated at todos path');
  console.log('patch, inversePatch', patch, inversePatch);
});

setTimeout(() => {
  unwatch();
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
