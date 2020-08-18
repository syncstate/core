# 🧬 SyncState

SyncState is a **document-based state management library** for JS apps that can power realtime multi-user, offline-first, undoable states across systems.

**Functional & React-way**

JSON patches as actions which can be transferred between the threads and sessions.

**Like Redux, like MobX**

The state is functional but the internal reactivity is based on the MobX approach.

**Versioning** (Optional)

Undo / Redo middleware that stores the changes (instead of the app state).

**Server**
(Optional)

Comes with a bit of server piece that works for conflict resolution.

## Use it for games or for documents

Battle tested in BuilderX, a realtime collaborative design tool.

## Why do I need another state management library?

[We](https://geekyants.com) are a big fan of Redux, Recoil, MobX and MobX-State-Tree. Each one of them solve similar problems in their own ways. But, we have realized that building **realtime multi-user** apps requires a bit more effort than storing and retrieving states.

Like:

- Efficient re-rendering of the mounted components.
- Data syncing between threads & sessions.
- Conflict resolution between multiple sessions.
- Local History (Undo / Redo) & Remote History (Versioning).
- Standard replay-able actions over custom actions.
- Optimistic updates and reversal when invalid.

## Highlights

- SyncState is based on Redux that uses JSON patches for actions.
- Also, it doesn't use `connect()` to connect state to React components, it's based on events (actions) for greater performance. It uses a `useDoc()` hook that listens to the updates on the `path` ([push strategy](https://twitter.com/kentcdodds/status/1180157212485771264)) that the component is listening to and forces an update. (like Recoil).
- We don't pass down states to components but use paths instead. It works like an ID that can be used to re-render the components. It also helps in not maintaining `index` with actions like Redux.

## When to use it?

If you are building a realtime document based app like Google Docs or Figma, SyncState can help solve a lot of your problems.

## Can I use SyncState for general purpose apps?

Yes, you can use it for general purpose state management. It only helps to adopt realtime and multi-user capabilities at a later stage.

# Comparison with Redux

- SyncState uses `Redux` but doesn't use `react-redux`
- We store patches (or actions) along with the state in the global store.

```jsx
{
    doc: {},
    patches: []
}
```

- State can be computed by applying the series of patches.
- We pass down `paths` instead of a part of the `state`

### No react-redux

- SyncState doesn't use `react-redux` and it's `connect()` method, mainly to achieve higher performance. `connect()` method is always executed on the mounted components even if the component doesn't need a re-render. There are techniques to make the `connect()` method performant with `selection` and `caching` but the underlying philosophy remains the same.

![No react-redux image](https://github.com/syncstate/syncstate/blob/feat/readme/assets/no-redux.png)

- SyncState uses Redux but the re-renders are based on **push-based state management** like MobX.

# Comparison with Recoil

- Uses the performant re-renders like Recoil. Recoil works on ID whereas SyncState works on Document Paths.

# Comparison with MobX & MST

- Uses the performant re-renders like MobX.
- It's not directly mutable like MobX & MST but the same can be easily achieved here with the usage of Immer.js because Immer generates patches along with the next state. SyncState needs patches to generate the next state and emit the same to the connected sessions.

# Getting started

```jsx
npm install @syncstate/core --save
```

# Basic use-case

```jsx
```

# Middlewares

[Undo Middleware](#undo-middleware)

- REST middleware
  - Connect the document to REST endpoints.
- GraphQL
  - Use the GraphQL middleware to save / retrieve states from GraphQL enpoint
- Socket
  - ...

# Undo Middleware

- Undo / Redo stack is local
- Performing any Undo or Redo is a new patch on the document
- Undo / Redo

```tsx
import { syncstateHistory, undoable, enableUndoCheckpoint } from "syncstate-history";

const doc = createDoc(
  { todos: [], filter: 'all' },
  applyMiddleware(syncstateHistory)
);

enableUndoCheckpoint()

undoable((patch) => {
	if(patch.path.startsWith("/todos") {
		return true;
	}
});

// Undo action
doc.dispatch({
	type: "UNDO"
})

// Redo action
doc.dispatch({
	type: "REDO"
})

// Undo action
doc.dispatch({
	type: "UNDO_TILL_BREAKPOINT"
})

// Redo action
doc.dispatch({
	type: "REDO_TILL_BREAKPOINT"
})

doc.dispatch({
	type: "INSERT_UNDO_BREAKPOINT"
})

// Checkpoint patch
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
```

# Differences with redux-undo

- It doesn't replace with the entire snapshot of the app. Instead it applies a patch on the document from the Undo / Redo stack.

```tsx
add todo
checkpoint
add todo
checkpoint
check todo
```

Built with ❤️ at GeekyAnts.

**Author:** Sanket Sahu, Himanshu Satija & Rohit Singh
