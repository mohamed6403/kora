'use client';

import type { Match, Team } from '@/types';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import MatchForm from './match-form';
import { useToast } from '@/hooks/use-toast';
import { deleteMatch } from '@/app/actions';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface MatchManagementProps {
  leagueId: string;
  leagueName: string;
  teams: Team[];
  matches: Match[];
}

export default function MatchManagement({ leagueId, leagueName, teams, matches }: MatchManagementProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const { toast } = useToast();
  
  const teamsMap = new Map(teams.map(team => [team.id, team.name]));

  const handleEdit = (match: Match) => {
    setSelectedMatch(match);
    setDialogOpen(true);
  };
  
  const handleAdd = () => {
    setSelectedMatch(null);
    setDialogOpen(true);
  };
  
  const handleDelete = async (matchId: string) => {
    const result = await deleteMatch(leagueId, matchId);
    if (result.success) {
        toast({ title: 'Success', description: 'Match deleted successfully.' });
    } else {
        toast({ variant: 'destructive', title: 'Error', description: result.error });
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="font-headline">Match Management</CardTitle>
              <CardDescription>Add, edit, or delete matches in this league.</CardDescription>
            </div>
            <Button onClick={handleAdd}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Match
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {matches.length > 0 ? (
              matches.map((match) => (
                <Card key={match.id} className="flex items-center justify-between p-4">
                  <div>
                    <p className="font-semibold">
                      {teamsMap.get(match.homeTeamId) || 'N/A'} vs {teamsMap.get(match.awayTeamId) || 'N/A'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {format(match.dateTime, 'PPP p')}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                     {match.status === 'finished' && (
                        <p className="font-bold text-lg">{match.homeGoals} - {match.awayGoals}</p>
                     )}
                     <div className="flex gap-2">
                        <Button variant="outline" size="icon" onClick={() => handleEdit(match)}>
                            <Edit className="h-4 w-4" />
                        </Button>
                         <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive" size="icon">
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This action cannot be undone. This will permanently delete the match. The team stats will be recalculated.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDelete(match.id)}>Continue</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                     </div>
                  </div>
                </Card>
              ))
            ) : (
              <p className="text-center text-muted-foreground py-10">
                No matches found. Add one to get started.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <MatchForm
        open={dialogOpen}
        setOpen={setDialogOpen}
        leagueId={leagueId}
        teams={teams}
        match={selectedMatch}
      />
    </>
  );
}
