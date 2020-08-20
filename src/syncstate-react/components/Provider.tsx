import React, { ReactChildren, ReactChild } from 'react';

import { SyncStateReactContext } from './Context';

export function Provider({
  store,
  children,
}: {
  store: any;
  children: ReactChildren | ReactChild;
}) {
  return (
    <SyncStateReactContext.Provider value={store}>
      {children}
    </SyncStateReactContext.Provider>
  );
}
