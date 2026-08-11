import React, { ReactNode } from 'react';
import { AuthContext } from '@/contexts/AuthContext';
import { TooltipProvider } from '@/components/ui/tooltip';

export const wrapper = ({ children }: { children: ReactNode }) => {
  return (
    <AuthContext.Provider value={{ user: { id: 'test-user-id' } } as any}>
      <TooltipProvider delayDuration={500}>
        {children}
      </TooltipProvider>
    </AuthContext.Provider>
  );
};
