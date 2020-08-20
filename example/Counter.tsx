import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { createDoc, Provider, history } from '../src';

import { useDoc } from '../src';

const doc = createDoc({ count: 0 }, [history.syncStateHistory]);

function App() {
  const [doc, setDoc, dispatch] = useDoc();

  const increment = () =>
    setDoc(doc => {
      doc.count++;
    });

  const decrement = () =>
    setDoc(doc => {
      doc.count--;
    });

  return (
    <div className="App">
      <h1>Counter with SyncState</h1>
      <div>
        <button onClick={decrement}>-</button>
        &nbsp;&nbsp;
        {doc.count}
        &nbsp;&nbsp;
        <button onClick={increment}>+</button>
      </div>

      <div className="undoredo">
        <button
          onClick={() => {
            dispatch(history.undo());
          }}
        >
          Undo
        </button>
        <button
          onClick={() => {
            dispatch(history.redo());
          }}
        >
          Redo
        </button>
      </div>
    </div>
  );
}

const rootElement = document.getElementById('root');
ReactDOM.render(
  <Provider doc={doc}>
    <App />
  </Provider>,
  rootElement
);
