import * as React from 'react';
import * as ReactDOM from 'react-dom';
import history from '@syncstate/history';
import { useDoc } from '@syncstate/react';
import { TodoItem } from './TodoItem';
import { useState, useEffect } from 'react';

export function TodoApp() {
  const todoPath = ['todos'];
  const filterPath = ['filter'];

  const [todos, setTodos, dispatch] = useDoc(todoPath);
  const [todoFilter] = useDoc(filterPath);
  const [state, setState] = useDoc();

  const [input, setInput] = useState('');

  useEffect(() => {
    dispatch(history.watchPath(['todos']));
  }, []);
  // if (!doc.getState().loaded) {
  //   return <div>Loading...</div>;
  // }

  // console.log('todo app render');

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

  // console.log(filteredTodos, 'filteredTodos');

  const addTodo = todoItem => {
    // dispatch({
    //   type: 'INSERT_UNDO_BREAKPOINT',
    //   payload: { path: ['todos', 0] },
    // });
    setTodos(todos => {
      todos.push({
        caption: todoItem,
        completed: false,
      });
    });
  };
  const modifyFilter = filter => {
    setState(state => {
      state.filter = filter;
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
              key={todoItemWithIndex.index} // should not be index ideally, use some kind of id
              todoItemPath={[...todoPath, todoItemWithIndex.index]}
            />
          ))}
        </ul>
      </div>
      <input
        type="text"
        value={input}
        onChange={e => setInput(e.target.value)}
      />
      <button
        type="button"
        onClick={() => {
          addTodo(input);
        }}
      >
        Add Todo
      </button>
      <div>
        <button
          onClick={() => {
            dispatch(history.undoPath(['todos']));
          }}
        >
          Undo
        </button>
        <button
          onClick={() => {
            dispatch(history.redoPath(['todos']));
          }}
        >
          Redo
        </button>
        <button
          onClick={() => {
            dispatch(history.undoPathTillBreakpoint(['todos']));
          }}
        >
          Undo till breakpoint
        </button>
        <button
          onClick={() => {
            dispatch(history.redoPathTillBreakpoint(['todos']));
          }}
        >
          Redo till breakpoint
        </button>
      </div>
    </div>
  );
}
