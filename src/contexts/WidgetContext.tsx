import React, { createContext, useContext, useState, ReactNode } from 'react';

interface WidgetContextType {
  shouldOpenAddEntry: boolean;
  setShouldOpenAddEntry: (value: boolean) => void;
}

const WidgetContext = createContext<WidgetContextType | undefined>(undefined);

export function WidgetProvider({ children }: { children: ReactNode }) {
  const [shouldOpenAddEntry, setShouldOpenAddEntry] = useState(false);

  return (
    <WidgetContext.Provider value={{ shouldOpenAddEntry, setShouldOpenAddEntry }}>
      {children}
    </WidgetContext.Provider>
  );
}

export function useWidget() {
  const context = useContext(WidgetContext);
  if (!context) {
    throw new Error('useWidget must be used within WidgetProvider');
  }
  return context;
}

