import { useDoc } from '@syncstate/react';
import * as React from 'react';
import get = require('lodash.get');

export const TodoItem = React.memo(
  function TodoItem({ todoItemPath }: any) {
    const [todoItem, setTodoItem, dispatch] = useDoc(todoItemPath);

    const updateTodoItemCaption = (caption: string) => {
      setTodoItem(todoItem => {
        todoItem.caption = caption;
      });
    };
    const updateTodoItemCompleted = (completed: boolean) => {
      setTodoItem(todoItem => {
        todoItem.completed = completed;
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
  },
  (prevProps, nextProps) => {
    console.log('prevProps, nextProps', prevProps, nextProps);
    return true;
  }
);
