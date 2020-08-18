import { useDoc } from '../src';
import * as React from 'react';

export function TodoItem({ todoItemPath }) {
  const [todoItem, dispatch] = useDoc(todoItemPath);

  const updateTodoItemCaption = (caption: string) => {
    dispatch({
      type: 'PATCH',
      payload: {
        op: 'replace',
        path: todoItemPath + '/caption',
        value: caption,
      },
    });
  };
  const updateTodoItemCompleted = (completed: boolean) => {
    dispatch({
      type: 'PATCH',
      payload: {
        op: 'replace',
        path: todoItemPath + '/completed',
        value: completed,
      },
    });
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
