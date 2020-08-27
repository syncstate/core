import { createDocStore } from '../src';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Provider, useDoc } from '@syncstate/react';

const store = createDocStore({ todos: [] });

// wrap your App with Provider and pass the store prop
ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root')
);

function App() {
  const todoPath = ['todos'];
  const [todos, setTodos] = useDoc(todoPath);

  let input;

  const addTodo = (todoItem: any) => {
    setTodos((todos: any) => {
      todos.push({
        caption: todoItem,
      });
    });
  };

  return (
    <div>
      <ul>
        {todos.map(todo => (
          <li>{todo.caption}</li>
        ))}
      </ul>
      <form
        onSubmit={e => {
          e.preventDefault();
          if (!input.value.trim()) {
            return;
          }
          addTodo(input.value);
          input.value = '';
        }}
      >
        <input ref={node => (input = node)} />
        <button type="submit">Add Todo</button>
      </form>
    </div>
  );
}
