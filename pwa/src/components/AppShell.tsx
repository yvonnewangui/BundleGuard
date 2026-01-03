'use client';

import { ReactNode } from 'react';
import { TopNav, BottomNav } from './Navigation';

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <TopNav />
      <main className="pt-14 pb-20 px-4">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
