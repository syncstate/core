import 'react-app-polyfill/ie11';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { createDocStore, Provider, useDoc, history } from '../src';
import { useState } from 'react';
import { TodoApp } from './Todo';
import { applyMiddleware } from 'redux';

const store = createDocStore({ todos: [], filter: 'all' }, [history.plugin]);

store.setDoc(doc => {
  doc.test = 'Awdwdwdd';
});
// undoable(() => true);

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
