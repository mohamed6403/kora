'use client';

import { useEffect, useState, useCallback, use } from 'react';
import * as db from '@/lib/supabase-db';
import type { League, Team, Match } from '@/types';
import AdminHeader from '@/components/admin/admin-header';
import { useAuth } from '@/context/auth-provider';
import { useRouter } from 'next/navigation';
import TeamManagement from '@/components/admin/team-management';
import MatchManagement from '@/components/admin/match-management';
import StandingsAutomation from '@/components/admin/standings-automation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface AdminLeaguePageProps {
  params: { slug: string };
}

export default function AdminLeaguePage({ params }: AdminLeaguePageProps) {
  // Use React.use() to unwrap the params object.
  // This is the modern, recommended way to access route parameters
  // in Next.js to support streaming and future React features.
  const { slug } = use(params);
  
  const { user, isAdmin, loading: authLoading } = useAuth();
  const router = useRouter();
  const [league, setLeague] = useState<League | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const leagueData = await db.getLeagueBySlug(slug);
      if (leagueData) {
          setLeague(leagueData);
          const teamsData = await db.getTeamsByLeagueId(leagueData.id);
          const matchesData = await db.getMatchesByLeagueId(leagueData.id);
          setTeams(teamsData);
          setMatches(matchesData);
      } else {
          setLeague(null);
      }
    } catch (error) {
      console.error('Error fetching league data:', error);
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/admin/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    fetchData();
    // Listen for custom event to refetch data
    window.addEventListener('data-changed', fetchData);
    return () => {
        window.removeEventListener('data-changed', fetchData);
    };
  }, [fetchData]);


  if (authLoading || loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!league) {
    return (
      <>
        <AdminHeader />
        <main className="container mx-auto px-4 py-8">
          <p>League not found.</p>
        </main>
      </>
    );
  }

  if (!isAdmin) {
    return null; // Or a permission denied component
  }

  return (
    <div className="min-h-screen bg-background">
      <AdminHeader />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
            <Link href="/admin" className="flex items-center gap-2 text-primary hover:underline mb-4">
                <ArrowLeft size={16} />
                Back to all leagues
            </Link>
            <h1 className="text-3xl font-bold font-headline">{league.name} Management</h1>
        </div>

        <Tabs defaultValue="teams">
          <TabsList>
            <TabsTrigger value="teams">Teams</TabsTrigger>
            <TabsTrigger value="matches">Matches</TabsTrigger>
            <TabsTrigger value="automation">Standings Automation</TabsTrigger>
          </TabsList>
          <TabsContent value="teams" className="mt-4">
            <TeamManagement league={league} teams={teams} />
          </TabsContent>
          <TabsContent value="matches" className="mt-4">
            <MatchManagement leagueId={league.id} teams={teams} matches={matches} leagueName={league.name} />
          </TabsContent>
          <TabsContent value="automation" className="mt-4">
            <StandingsAutomation league={league} teams={teams} matches={matches} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
