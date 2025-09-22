'use client';

import type { FC } from 'react';
import { useState, useEffect, useCallback, use } from 'react';
import * as db from '@/lib/supabase-db';
import type { Team, Match, League } from '@/types';
import MatchCard from '@/components/match-card';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';

interface TeamPageProps {
  params: { slug: string; teamId: string };
}

const TeamPage: FC<TeamPageProps> = ({ params }) => {
  // Use React.use() to unwrap the params object.
  // This is the modern, recommended way to access route parameters
  // in Next.js to support streaming and future React features.
  const { slug, teamId } = use(params);

  const [league, setLeague] = useState<League | null>(null);
  const [team, setTeam] = useState<Team | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [allTeams, setAllTeams] = useState<Map<string, Team>>(new Map());
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const leagueData = await db.getLeagueBySlug(slug);
      if (leagueData) {
        setLeague(leagueData);
        const teamData = await db.getTeamById(teamId);
        setTeam(teamData);

        const allTeamsData = await db.getTeamsByLeagueId(leagueData.id);
        const teamsMap = new Map(allTeamsData.map(t => [t.id, t]));
        setAllTeams(teamsMap);

        const allMatches = await db.getMatchesByLeagueId(leagueData.id);
        const teamMatches = allMatches.filter(m => m.homeTeamId === teamId || m.awayTeamId === teamId);
        setMatches(teamMatches);

      } else {
        setLeague(null);
        setTeam(null);
      }
    } catch (error) {
      console.error('Error fetching team data:', error);
    } finally {
      setLoading(false);
    }
  }, [slug, teamId]);


  useEffect(() => {
    fetchData();
    // Listen for custom event to refetch data when it changes
    window.addEventListener('data-changed', fetchData);
    return () => {
        window.removeEventListener('data-changed', fetchData);
    };
  }, [fetchData]);


  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 space-y-6">
        <Skeleton className="h-6 w-48" />
        <div className="flex items-center gap-4">
          <Skeleton className="h-16 w-16 rounded-full" />
          <Skeleton className="h-10 w-64" />
        </div>
        <div className="grid md:grid-cols-2 gap-6">
            <div>
                <Skeleton className="h-8 w-32 mb-4" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full mt-4" />
            </div>
            <div>
                <Skeleton className="h-8 w-32 mb-4" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full mt-4" />
            </div>
        </div>
      </div>
    );
  }

  if (!team || !league) {
    return <div className="text-center py-20">Team or League not found.</div>;
  }
  
  const enrichedMatches = matches.map(match => ({
    ...match,
    homeTeamName: allTeams.get(match.homeTeamId)?.name || 'N/A',
    awayTeamName: allTeams.get(match.awayTeamId)?.name || 'N/A',
    homeTeamLogo: allTeams.get(match.homeTeamId)?.logoURL,
    awayTeamLogo: allTeams.get(match.awayTeamId)?.logoURL,
  }));
  
  const fixtures = enrichedMatches.filter(m => m.status === 'upcoming').sort((a,b) => a.dateTime.getTime() - b.dateTime.getTime());
  const results = enrichedMatches.filter(m => m.status === 'finished');


  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">
        <Link href={`/leagues/${slug}`} className="flex items-center gap-2 text-primary hover:underline mb-6">
          <ArrowLeft size={16} />
          Back to {league.name}
        </Link>
        <div className="flex items-center gap-4 mb-8">
          <Image
            src={team.logoURL}
            alt={`${team.name} logo`}
            width={64}
            height={64}
            className="rounded-full object-cover"
            data-ai-hint="team logo"
          />
          <h1 className="text-4xl font-bold font-headline">{team.name}</h1>
        </div>
        
        <Card className="mb-8">
          <CardContent className="pt-6">
            <dl className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
              <div>
                <dt className="text-sm text-muted-foreground">Played</dt>
                <dd className="text-2xl font-bold">{team.played}</dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">Wins</dt>
                <dd className="text-2xl font-bold text-green-500">{team.wins}</dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">Draws</dt>
                <dd className="text-2xl font-bold">{team.draws}</dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">Losses</dt>
                <dd className="text-2xl font-bold text-red-500">{team.losses}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>


        <div className="grid md:grid-cols-2 gap-8">
          <section>
            <h2 className="text-2xl font-bold font-headline mb-4">Upcoming Fixtures</h2>
            <div className="space-y-4">
                {fixtures.length > 0 ? (
                    fixtures.map(match => <MatchCard key={match.id} match={match} />)
                ) : (
                    <Card><CardContent className="pt-6 text-center text-muted-foreground">No upcoming fixtures.</CardContent></Card>
                )}
            </div>
          </section>
          <section>
            <h2 className="text-2xl font-bold font-headline mb-4">Past Results</h2>
            <div className="space-y-4">
                {results.length > 0 ? (
                    results.map(match => <MatchCard key={match.id} match={match} />)
                ) : (
                    <Card><CardContent className="pt-6 text-center text-muted-foreground">No results available.</CardContent></Card>
                )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default TeamPage;
