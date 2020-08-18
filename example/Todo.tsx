import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { useDoc } from '../src';
import { TodoItem } from './TodoItem';
import { useState } from 'react';
import SyncStateReactContext from '../src/syncstate-react/components/Context';

export function TodoApp() {
  const todoPath = '/todos';
  const filterPath = '/filter';

  const [todos, dispatch] = useDoc(todoPath);
  const [todoFilter] = useDoc(filterPath);

  // TODO: can't do this, create a hook maybe?
  const doc: any = React.useContext(SyncStateReactContext);

  const [input, setInput] = useState('');

  console.log('todos', todos);

  const filteredTodos = todos
    .map((todoItem, index) => ({ todoItem, index }))
    .filter(todoItemWithIndex => {
      if (todoFilter === 'all') {
        return true;
      } else if (todoFilter === 'completed') {
        return todoItemWithIndex.todoItem.completed;
      } else if (todoFilter === 'incomplete') {
        return !todoItemWithIndex.todoItem.completed;
      }
    });

  console.log(filteredTodos, 'filteredTodos');

  const addTodo = todoItem => {
    dispatch({
      type: 'PATCH',
      payload: {
        op: 'add',
        path: todoPath + '/-',
        value: {
          caption: todoItem,
          completed: false,
        },
      },
    });
  };
  const modifyFilter = filter => {
    dispatch({
      type: 'PATCH',
      payload: {
        op: 'replace',
        path: filterPath,
        value: filter,
      },
    });
  };

  return (
    <div>
      <h1>Todo App with syncstate</h1>
      <div>
        Filter:{' '}
        <div>
          <input
            type="radio"
            id="filter1"
            name="filter"
            value="all"
            onChange={e => {
              modifyFilter(e.target.value);
            }}
          />
          <label htmlFor="filter1">All</label>

          <input
            type="radio"
            id="filter2"
            name="filter"
            value="completed"
            onChange={e => {
              modifyFilter(e.target.value);
            }}
          />
          <label htmlFor="filter2">Completed</label>

          <input
            type="radio"
            id="filter3"
            name="filter"
            value="incomplete"
            onChange={e => {
              modifyFilter(e.target.value);
            }}
          />
          <label htmlFor="filter3">Incomplete</label>
        </div>
      </div>
      <div>
        <ul>
          {filteredTodos.map(todoItemWithIndex => (
            <TodoItem
              key={todoItemWithIndex.todoItem.caption}
              todoItemPath={todoPath + '/' + todoItemWithIndex.index}
            />
          ))}
        </ul>
      </div>
      <input
        type="text"
        value={input}
        onChange={e => setInput(e.target.value)}
      />
      <button type="button" onClick={() => addTodo(input)}>
        Add Todo
      </button>
      <div>
        <button
          onClick={() => {
            doc.dispatch({ type: 'UNDO' });
          }}
        >
          Undo
        </button>
        <button
          onClick={() => {
            doc.dispatch({ type: 'REDO' });
          }}
        >
          Redo
        </button>
      </div>
    </div>
  );
}
