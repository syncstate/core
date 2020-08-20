import 'react-app-polyfill/ie11';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { createDoc, Provider, useDoc, history } from '../src';
import { useState } from 'react';
import { TodoApp } from './Todo';
import { applyMiddleware } from 'redux';

const doc = createDoc({ todos: [], filter: 'all' }, [history.syncStateHistory]);

// undoable(() => true);

const App = () => {
  return (
    <div>
      <TodoApp />
    </div>
  );
};

ReactDOM.render(
  <Provider doc={doc}>
    <App />
  </Provider>,
  document.getElementById('root')
);
