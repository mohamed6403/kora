'use client';

import { Button } from '@/components/ui/button';
import { LogOut, Shield } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/auth-provider';

export default function AdminHeader() {
  const { logout } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex">
          <Link href="/admin" className="flex items-center space-x-2">
            <Shield className="h-6 w-6 text-primary" />
            <span className="font-bold font-headline">BOTOLA Admin</span>
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-2">
            <Button variant="ghost" onClick={logout}>
                <LogOut className="mr-2 h-4 w-4" />
                Logout
            </Button>
        </div>
      </div>
    </header>
  );
}
