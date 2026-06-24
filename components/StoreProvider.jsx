'use client';

import { createContext, useContext, useRef } from 'react';
import { createRootStore } from '@/stores/RootStore';

const StoreContext = createContext(null);

export const StoreProvider = ({ children }) => {
  const storeRef = useRef(null);

  if (!storeRef.current) {
    storeRef.current = createRootStore();
  }

  return <StoreContext.Provider value={storeRef.current}>{children}</StoreContext.Provider>;
};

export const useStore = () => {
  const store = useContext(StoreContext);

  if (!store) {
    throw new Error('useStore must be used within StoreProvider');
  }

  return store;
};
