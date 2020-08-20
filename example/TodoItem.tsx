import { useDoc } from '../src';
import * as React from 'react';
import get = require('lodash.get');

export function TodoItem({ todoItemPath }) {
  console.log(todoItemPath, 'todoItemPath');
  const [todoItem, setTodoItem, dispatch] = useDoc(todoItemPath);

  const updateTodoItemCaption = (caption: string) => {
    setTodoItem(todoItem => {
      todoItem.caption = caption;
    });
    // dispatch({
    //   type: 'PATCH',
    //   payload: {
    //     op: 'replace',
    //     path: todoItemPath + '/caption',
    //     value: caption,
    //   },
    // });
  };
  const updateTodoItemCompleted = (completed: boolean) => {
    setTodoItem(todoItem => {
      todoItem.completed = completed;
    });
    // dispatch({
    //   type: 'PATCH',
    //   payload: {
    //     op: 'replace',
    //     path: todoItemPath + '/completed',
    //     value: completed,
    //   },
    // });
  };

  return (
    <li>
      <input
        type="checkbox"
        checked={todoItem.completed}
        onChange={e => {
          updateTodoItemCompleted(e.target.checked);
        }}
      />
      <input
        type="text"
        value={todoItem.caption}
        onChange={e => updateTodoItemCaption(e.target.value)}
      />
    </li>
  );
}
