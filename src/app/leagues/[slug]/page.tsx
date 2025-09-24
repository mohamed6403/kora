'use client';

import type { FC } from 'react';
import { useState, useEffect, useCallback, use } from 'react';
import * as db from '@/lib/supabase-db';
import type { League, Match, Team } from '@/types';
import StandingsTable from '@/components/standings-table';
import MatchCard from '@/components/match-card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Trophy } from 'lucide-react';
import Link from 'next/link';

interface LeaguePageProps {
  params: any;
}

const LeaguePage: FC<LeaguePageProps> = ({ params }) => {
  // Use React.use() to unwrap the params object.
  // This is the modern, recommended way to access route parameters
  // in Next.js to support streaming and future React features.
  // `params` is a Promise-like value in the new Next.js routing ABI.
  // Use React.use() to unwrap it and cast to the expected shape for TypeScript.
  const { slug } = use(params) as { slug: string };

  const [league, setLeague] = useState<League | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [teams, setTeams] = useState<Map<string, Team>>(new Map());
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const leagueData = await db.getLeagueBySlug(slug);

      if (leagueData) {
        setLeague(leagueData);
        const teamsData = await db.getTeamsByLeagueId(leagueData.id);
        const teamsMap = new Map(teamsData.map(t => [t.id, t]));
        setTeams(teamsMap);

        const matchesData = await db.getMatchesByLeagueId(leagueData.id);
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
    fetchData();
    // Listen for custom event to refetch data when it changes
    window.addEventListener('data-changed', fetchData);
    return () => {
        window.removeEventListener('data-changed', fetchData);
    };
  }, [fetchData]);

  const enrichedMatches = matches.map(match => ({
    ...match,
    homeTeamName: teams.get(match.homeTeamId)?.name || 'N/A',
    awayTeamName: teams.get(match.awayTeamId)?.name || 'N/A',
    homeTeamLogo: teams.get(match.homeTeamId)?.logoURL,
    awayTeamLogo: teams.get(match.awayTeamId)?.logoURL,
  }));

  const fixtures = enrichedMatches.filter(m => m.status === 'upcoming').sort((a,b) => a.dateTime.getTime() - b.dateTime.getTime());
  const results = enrichedMatches.filter(m => m.status === 'finished');

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 space-y-8">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-96 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!league) {
    return <div className="text-center py-20">League not found.</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">
        <Link href="/" className="flex items-center gap-2 text-primary hover:underline mb-6">
            <ArrowLeft size={16} />
            Back to all leagues
        </Link>
        <div className="flex items-center gap-4 mb-8">
          <Trophy className="h-10 w-10 text-primary" />
          <h1 className="text-4xl font-bold font-headline">{league.name}</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <StandingsTable leagueId={league.id} leagueSlug={league.slug} />
          </div>

          <div className="lg:col-span-1">
            <Tabs defaultValue="fixtures">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="fixtures">Fixtures</TabsTrigger>
                <TabsTrigger value="results">Results</TabsTrigger>
              </TabsList>
              <TabsContent value="fixtures" className="space-y-4 mt-4">
                {fixtures.length > 0 ? (
                  fixtures.map(match => <MatchCard key={match.id} match={match} />)
                ) : (
                  <p className="text-center text-muted-foreground pt-8">No upcoming fixtures.</p>
                )}
              </TabsContent>
              <TabsContent value="results" className="space-y-4 mt-4">
                {results.length > 0 ? (
                  results.map(match => <MatchCard key={match.id} match={match} />)
                ) : (
                  <p className="text-center text-muted-foreground pt-8">No results yet.</p>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  );
};

export default LeaguePage;
