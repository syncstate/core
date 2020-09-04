# 🧬 SyncState

SyncState is a **document-based state management library** for JS apps that can power realtime multi-user, offline-first, undoable states across systems.

- Elegant on the surface, yet scales to large apps.
- Based on JSON patches.
- Plugins for History, Multi-user and more.
- Powered by Redux and Immer

**Functional at the core. Mutate on the surface.**

JSON patches as actions which can be transferred between the threads and sessions. Supports local mutation with Immer.js.

**Like Redux, like MobX**

The state is functional but the internal reactivity is based on the MobX approach.

**Undo / Redo plugin**

A plugin that stores the changes as JSON patches (instead of a series of app snapshots).

**Easily build multiuser apps**

**The remote plugin helps** achieve multiuser functionality. It comes with a bit of server piece that works for conflict resolution.

### Documentation

Find Complete **Documentation** and much more [here](https://syncstate.github.io/docs/getting-started)

### Examples

[Some Examples for you to get started with SyncState](https://syncstate.github.io/docs/counter-example)

### Contributors

Have something to add? We are lucky to have you, head over to [Contribution Guidelines](https://github.com/syncstate/syncstate/blob/master/CONTRIBUTING.md) and learn how you can be a part of a wonderful community of SyncState.

## Installation

You can install `@syncstate/core` for the core functionality as a package from NPM.

```bash
# NPM
npm install @syncstate/core --save

# Yarn
yarn add @syncstate/core
```

The recommended way to use SyncState with React is to use `@syncstate/react`. It has a hook for reactive updates and a Provider component to make the store available to the whole app.

```bash
# NPM
npm install @syncstate/react --save

# Yarn
yarn add @syncstate/react
```

Both packages are available as CJS as well as ESM packages. The source code is written in TypeScript and the published code is compiled to ES5 for compatibility across older browsers.

## Counter example

```jsx
import { createDocStore } from '@syncstate/core';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Provider, useDoc } from '@syncstate/react';

// Create a store with an initial state
const store = createDocStore({ counter: 0 });

// Wrap your App with Provider and pass the store prop
ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root')
);

function App() {
  /**
   * useDoc hook with no arguments returns the root document and the function to modify the document.
   * This also adds a listener at the document root and updates the component
   * when the document changes.
   */
  const [doc, setDoc] = useDoc();

  const increment = () => {
    setDoc((doc) => {
      // This looks like a mutation but here we are updating the draft state
      // using Immer.js which generates JSON patches for our internal reducers.
      doc.counter++;
    });
  };

  const decrement = () => {
    setDoc((doc) => {
      doc.counter--;
    });
  };

  let input;

  return (
    <div>
      <button onClick={decrement}>-</button>
      {doc.count}
      <button onClick={increment}>+</button>
    </div>
  );
}
```

## Checkout Sanket launching SyncState at [React Native EU 2020](https://youtu.be/IWkQxg6RQ-A)

Built with ❤️ at GeekyAnts.

**Author:** Sanket Sahu, Himanshu Satija & Rohit Singh
