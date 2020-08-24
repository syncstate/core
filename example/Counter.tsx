import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { createDocStore } from '../src';
// import './styles.css';
import { useDoc, Provider } from '@syncstate/react';
import history from '@syncstate/history';
console.log(history, 'history');

const store = createDocStore({ count: 0 }, [history.plugin]);

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
      <h1>Counter (Undo/Redo) with SyncState</h1>
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
  <Provider store={store}>
    <App />
  </Provider>,
  rootElement
);
