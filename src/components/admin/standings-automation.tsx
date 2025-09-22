
'use client';

import { useState } from 'react';
import type { League, Team, Match } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { runAutomateStandingsUpdate } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Sparkles, Terminal } from 'lucide-react';

interface StandingsAutomationProps {
  league: League;
  teams: Team[];
  matches: Match[];
}

export default function StandingsAutomation({ league, teams, matches }: StandingsAutomationProps) {
  const [isAutomating, setIsAutomating] = useState(false);
  const { toast } = useToast();
  
  const finishedMatches = matches.filter(m => m.status === 'finished');
  const sortedTeams = [...teams].sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    return b.goalDifference - a.goalDifference;
  });

  const handleAutomate = async () => {
    setIsAutomating(true);
    const result = await runAutomateStandingsUpdate(league.id, league.name);
    setIsAutomating(false);
    
    if (result.success) {
      toast({
        title: 'Automation Complete',
        description: 'The league standings have been successfully updated.',
      });
    } else {
      toast({
        variant: 'destructive',
        title: 'Automation Failed',
        description: result.error || 'An unexpected error occurred.',
      });
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Current Standings</CardTitle>
                    <CardDescription>This is the current state of the league table before automation.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Team</TableHead>
                                <TableHead>P</TableHead>
                                <TableHead>W</TableHead>
                                <TableHead>D</TableHead>
                                <TableHead>L</TableHead>
                                <TableHead>GD</TableHead>
                                <TableHead>Pts</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {sortedTeams.length > 0 ? (
                            sortedTeams.map(team => (
                                <TableRow key={team.id}>
                                <TableCell className="font-medium">{team.name}</TableCell>
                                <TableCell>{team.played}</TableCell>
                                <TableCell>{team.wins}</TableCell>
                                <TableCell>{team.draws}</TableCell>
                                <TableCell>{team.losses}</TableCell>
                                <TableCell>{team.goalDifference}</TableCell>
                                <TableCell className="font-bold">{team.points}</TableCell>
                                </TableRow>
                            ))
                            ) : (
                            <TableRow>
                                <TableCell colSpan={7} className="h-24 text-center">
                                No teams in the league.
                                </TableCell>
                            </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>

        <div className="lg:col-span-1 space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">AI Automation</CardTitle>
                    <CardDescription>Use AI to recalculate the standings based on all finished matches.</CardDescription>
                </CardHeader>
                <CardContent>
                     <Alert>
                        <Terminal className="h-4 w-4" />
                        <AlertTitle>How it works</AlertTitle>
                        <AlertDescription>
                            The AI agent will process all <strong>{finishedMatches.length}</strong> finished match results and rebuild the entire league table to ensure accuracy.
                        </AlertDescription>
                    </Alert>
                </CardContent>
                <CardFooter>
                    <Button onClick={handleAutomate} disabled={isAutomating || finishedMatches.length === 0} className="w-full">
                        {isAutomating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                        Run AI Standings Update
                    </Button>
                </CardFooter>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Finished Matches</CardTitle>
                </CardHeader>
                <CardContent className="max-h-96 overflow-y-auto">
                    {finishedMatches.length > 0 ? (
                        <div className="space-y-2 text-sm">
                            {finishedMatches.map(match => {
                                const homeTeamName = teams.find(t => t.id === match.homeTeamId)?.name;
                                const awayTeamName = teams.find(t => t.id === match.awayTeamId)?.name;
                                return (
                                <div key={match.id} className="flex justify-between items-center p-2 rounded-md bg-muted/50">
                                    <span>{homeTeamName || '...'} vs {awayTeamName || '...'}</span>
                                    <span className="font-bold">{match.homeGoals} - {match.awayGoals}</span>
                                </div>
                                )
                            })}
                        </div>
                    ) : (
                        <p className="text-sm text-muted-foreground text-center py-4">No finished matches yet.</p>
                    )}
                </CardContent>
            </Card>
        </div>
    </div>
  );
}
