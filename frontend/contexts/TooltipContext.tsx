'use client';

import { createContext, useContext, useState, ReactNode, useMemo } from 'react';

interface TooltipContextValue {
  activeTooltipId: string | null;
  setActiveTooltipId: (id: string | null) => void;
}

const TooltipContext = createContext<TooltipContextValue | undefined>(undefined);

export function TooltipProvider({ children }: { children: ReactNode }) {
  const [activeTooltipId, setActiveTooltipId] = useState<string | null>(null);

  const value = useMemo(
    () => ({ activeTooltipId, setActiveTooltipId }),
    [activeTooltipId]
  );

  return (
    <TooltipContext.Provider value={value}>
      {children}
    </TooltipContext.Provider>
  );
}

export function useTooltipContext() {
  const context = useContext(TooltipContext);
  if (!context) {
    throw new Error('useTooltipContext must be used within TooltipProvider');
  }
  return context;
}
