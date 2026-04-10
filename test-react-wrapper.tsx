import React, { ReactNode } from 'react';
import { AuthContext } from '@/contexts/AuthContext';

export const wrapper = ({ children }: { children: ReactNode }) => {
  return (
    <AuthContext.Provider value={{ user: { id: 'test-user-id' } } as any}>
      {children}
    </AuthContext.Provider>
  );
};
