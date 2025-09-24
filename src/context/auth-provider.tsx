'use client';

import { createContext, useState, useEffect, useContext, type ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import type { UserProfile } from '@/types';

// Mock User object structure
interface User {
  uid: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  isAdmin: boolean;
  loading: boolean;
  login: (pass: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userProfile: null,
  isAdmin: false,
  loading: true,
  login: () => false,
  logout: () => {},
});

const ADMIN_EMAIL = 'admin@example.com';
const ADMIN_PASS = 'admin123';
const AUTH_KEY = 'botola_auth';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Check localStorage for a saved session on initial load
    const savedUser = localStorage.getItem(AUTH_KEY);
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      if (parsedUser.email === ADMIN_EMAIL) {
        setUser(parsedUser);
        setIsAdmin(true);
        setUserProfile({
            uid: parsedUser.uid,
            email: parsedUser.email,
            role: 'admin',
            createdAt: new Date()
        });
      }
    }
    setLoading(false);
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

  const login = (password: string): boolean => {
    if (password === ADMIN_PASS) {
      const newUser = { uid: 'admin_user', email: ADMIN_EMAIL };
      localStorage.setItem(AUTH_KEY, JSON.stringify(newUser));
      setUser(newUser);
      setIsAdmin(true);
      setUserProfile({
            uid: newUser.uid,
            email: newUser.email,
            role: 'admin',
            createdAt: new Date()
      });
      router.push('/admin');
      return true;
    }
    return false;
  };

  const logout = () => {
    localStorage.removeItem(AUTH_KEY);
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
