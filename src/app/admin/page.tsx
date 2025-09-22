'use client';

import { useAuth } from '@/context/auth-provider';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import * as db from '@/lib/supabase-db';
import type { League } from '@/types';
import AdminHeader from '@/components/admin/admin-header';
import LeagueManagement from '@/components/admin/league-management';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2 } from 'lucide-react';

export default function AdminDashboard() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const router = useRouter();
  const [leagues, setLeagues] = useState<League[]>([]);
  const [loadingLeagues, setLoadingLeagues] = useState(true);

  const fetchLeagues = async () => {
    setLoadingLeagues(true);
    try {
      const leaguesData = await db.getLeagues();
      setLeagues(leaguesData);
    } catch (error) {
      console.error('Error fetching leagues:', error);
    } finally {
      setLoadingLeagues(false);
    }
  };

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/admin/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      fetchLeagues();
      // Listen for custom event to refetch data
      window.addEventListener('data-changed', fetchLeagues);
      return () => {
        window.removeEventListener('data-changed', fetchLeagues);
      };
    }
  }, [user]);

  if (authLoading || !user || !isAdmin) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <AdminHeader />
      <main className="container mx-auto px-4 py-8">
        {loadingLeagues ? (
          <div>
            <div className="flex justify-between items-center mb-6">
                <Skeleton className="h-10 w-48" />
                <Skeleton className="h-10 w-32" />
            </div>
            <div className="space-y-4">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
            </div>
          </div>
        ) : (
          <LeagueManagement leagues={leagues} />
        )}
      </main>
    </div>
  );
}
