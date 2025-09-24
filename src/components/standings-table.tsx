"use client";

import type { FC } from 'react';
import { useState, useEffect, useCallback } from 'react';
import * as db from '@/lib/supabase-db';
import type { Team } from '@/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';
import Link from 'next/link';

interface StandingsTableProps {
  leagueId: string;
  leagueSlug: string;
}

const StandingsTable: FC<StandingsTableProps> = ({ leagueId, leagueSlug }) => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStandings = useCallback(async () => {
    if (!leagueId) return;
    setLoading(true);
    try {
      const teamsData = await db.getTeamsByLeagueId(leagueId);
      // Sort by points and then goal difference
      teamsData.sort((a, b) => {
        if (b.points !== a.points) {
          return b.points - a.points;
        }
        return b.goalDifference - a.goalDifference;
      });
      setTeams(teamsData);
    } catch (error) {
      console.error('Error fetching standings:', error);
      setTeams([]);
    } finally {
      setLoading(false);
    }
  }, [leagueId]);

  useEffect(() => {
    fetchStandings();
    // Listen for custom event to auto-update the table
    window.addEventListener('data-changed', fetchStandings);
    // Also subscribe to realtime updates for this league (teams/matches)
    const channel = db.subscribeToLeagueUpdates(leagueId, (payload: any) => {
      // When a team or match changes in the league, refetch standings
      fetchStandings();
    });

    return () => {
        window.removeEventListener('data-changed', fetchStandings);
        // cleanup realtime subscription
        if (channel && typeof (channel as any).unsubscribe === 'function') {
          try { (channel as any).unsubscribe(); } catch (e) { /* ignore */ }
        }
    };
  }, [fetchStandings]);

  const renderSkeleton = (key: number) => (
    <TableRow key={key}>
      <TableCell className="font-medium">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-4 rounded-full" />
          <Skeleton className="h-4 w-24" />
        </div>
      </TableCell>
      {[...Array(8)].map((_, i) => (
        <TableCell key={i}>
          <Skeleton className="h-4 w-8" />
        </TableCell>
      ))}
    </TableRow>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">League Standings</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[250px]">Team</TableHead>
                <TableHead>P</TableHead>
                <TableHead>W</TableHead>
                <TableHead>D</TableHead>
                <TableHead>L</TableHead>
                <TableHead>GF</TableHead>
                <TableHead>GA</TableHead>
                <TableHead>GD</TableHead>
                <TableHead className="font-bold">Pts</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                [...Array(5)].map((_, i) => renderSkeleton(i))
              ) : teams.length > 0 ? (
                teams.map(team => (
                  <TableRow key={team.id}>
                    <TableCell className="font-medium">
                       <Link href={`/leagues/${leagueSlug}/teams/${team.id}`} className="flex items-center gap-3 hover:underline">
                        <Image
                          src={team.logoURL}
                          alt={`${team.name} logo`}
                          width={24}
                          height={24}
                          className="rounded-full object-cover"
                          data-ai-hint="team logo"
                        />
                        <span>{team.name}</span>
                      </Link>
                    </TableCell>
                    <TableCell>{team.played}</TableCell>
                    <TableCell>{team.wins}</TableCell>
                    <TableCell>{team.draws}</TableCell>
                    <TableCell>{team.losses}</TableCell>
                    <TableCell>{team.goalsFor}</TableCell>
                    <TableCell>{team.goalsAgainst}</TableCell>
                    <TableCell>{team.goalDifference}</TableCell>
                    <TableCell className="font-bold">{team.points}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={9} className="h-24 text-center">
                    No teams found for this league.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default StandingsTable;
