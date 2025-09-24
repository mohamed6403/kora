'use client';

import { createContext, useState, useEffect, useContext, type ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import type { UserProfile } from '@/types';
import { supabase } from '@/lib/supabase-client';

// We'll map the supabase user to a minimal User shape used in the app
interface User {
  uid: string;
  email: string | null;
}

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  isAdmin: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userProfile: null,
  isAdmin: false,
  loading: true,
  login: async () => ({ success: false }),
  logout: async () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();
  const pathname = usePathname();

  // Initialize session from Supabase
  useEffect(() => {
    let mounted = true;

    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!mounted) return;
      if (session?.user) {
        const u = { uid: session.user.id, email: session.user.email ?? null };
        setUser(u);
        // Simple admin check: email match
        const adminFlag = (session.user.email ?? '') === 'admin@example.com';
        setIsAdmin(adminFlag);
        setUserProfile({ uid: u.uid, email: u.email ?? '', role: adminFlag ? 'admin' : 'user', createdAt: new Date() } as any);
      }
      setLoading(false);
    };

    init();

    // Listen for auth state changes
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const u = { uid: session.user.id, email: session.user.email ?? null };
        setUser(u);
        const adminFlag = (session.user.email ?? '') === 'admin@example.com';
        setIsAdmin(adminFlag);
        setUserProfile({ uid: u.uid, email: u.email ?? '', role: adminFlag ? 'admin' : 'user', createdAt: new Date() } as any);
        router.push('/admin');
      } else {
        setUser(null);
        setIsAdmin(false);
        setUserProfile(null);
        // keep user on login page if they're on admin routes
        if (pathname?.startsWith('/admin')) router.push('/admin/login');
      }
    });

    return () => {
      mounted = false;
      listener?.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    // Redirect logic based on auth state
    if (!loading && pathname) {
      if (!isAdmin && pathname.startsWith('/admin') && pathname !== '/admin/login') {
        router.push('/admin/login');
      }
      if (isAdmin && pathname === '/admin/login') {
        router.push('/admin');
      }
    }
  }, [isAdmin, loading, pathname, router]);

  const login = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        console.error('Supabase sign in error:', error.message);
        return { success: false, error: error.message };
      }
      if (data?.user) {
        const u = { uid: data.user.id, email: data.user.email ?? null };
        setUser(u);
        const admin = (data.user.email ?? '') === 'admin@example.com';
        setIsAdmin(admin);
        setUserProfile({ uid: u.uid, email: u.email ?? '', role: admin ? 'admin' : 'user', createdAt: new Date() } as any);
        // Redirect immediately to admin after successful sign-in
        try {
          router.push('/admin');
        } catch (err) {
          // ignore navigation errors
        }
        return { success: true };
      }
      return { success: false, error: 'No user returned from sign-in' };
    } catch (err: any) {
      console.error('Unexpected login error:', err);
      return { success: false, error: err?.message || String(err) };
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setIsAdmin(false);
    setUserProfile(null);
    router.push('/admin/login');
  };

  return (
    <AuthContext.Provider value={{ user, userProfile, isAdmin, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
