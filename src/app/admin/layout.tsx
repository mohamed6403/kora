import { AuthProvider } from '@/context/auth-provider';
import type { ReactNode } from 'react';

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
      <AuthProvider>
        {children}
      </AuthProvider>
  );
}
