import React from 'react';

export const SyncStateReactContext: any = /*#__PURE__*/ React.createContext(
  null
);

if (process.env.NODE_ENV !== 'production') {
  SyncStateReactContext.displayName = 'SyncStateReact';
}

export default SyncStateReactContext;
