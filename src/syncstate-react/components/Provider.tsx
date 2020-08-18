import React, { ReactChildren, ReactChild } from 'react';

import { SyncStateReactContext } from './Context';

export function Provider({
  doc,
  children,
}: {
  doc: any;
  children: ReactChildren | ReactChild;
}) {
  return (
    <SyncStateReactContext.Provider value={doc}>
      {children}
    </SyncStateReactContext.Provider>
  );
}
