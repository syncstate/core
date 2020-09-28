import * as React from 'react';
import * as ReactDOM from 'react-dom';
import history from '@syncstate/history';
import { useDoc, useComputed } from '@syncstate/react';
import { TodoItem } from './TodoItem';
import { useState, useEffect } from 'react';

export function TodoApp() {
  const todoPath = '/todos';
  const filterPath = '/filter';

  const [todos, setTodos, dispatch] = useDoc(todoPath);
  const [todoFilter, setTodoFilter] = useDoc(filterPath);

  const [input, setInput] = useState('');

  useEffect(() => {
    dispatch(history.enable('/todos'));
  }, []);

  // const [todoLength] = useComputed('doc', getValue => {
  //   const todos = getValue('/todos');

  //   return todos.length;
  // });

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

    setInput('');
  };
  const modifyFilter = filter => {
    setTodoFilter(filter);
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
            checked={todoFilter === 'all'}
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
            checked={todoFilter === 'completed'}
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
            checked={todoFilter === 'incomplete'}
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
              todoItemPath={todoPath + '/' + todoItemWithIndex.index}
            />
          ))}
        </ul>
      </div>
      <form
        onSubmit={e => {
          e.preventDefault();
          addTodo(input);
        }}
      >
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
        />
        <button type="submit">Add Todo</button>
      </form>
      <div>
        <button
          onClick={() => {
            dispatch(history.undoPath('/todos'));
          }}
        >
          Undo
        </button>
        <button
          onClick={() => {
            dispatch(history.redoPath('/todos'));
          }}
        >
          Redo
        </button>
        <button
          onClick={() => {
            dispatch(history.undoPathTillBreakpoint('/todos'));
          }}
        >
          Undo till breakpoint
        </button>
        <button
          onClick={() => {
            dispatch(history.redoPathTillBreakpoint('/todos'));
          }}
        >
          Redo till breakpoint
        </button>
        <button
          onClick={() => {
            setTodos([]);
          }}
        >
          Clear
        </button>
      </div>
    </div>
  );
}
