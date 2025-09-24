'use client';

import type { League } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PlusCircle, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import CreateLeagueDialog from './create-league-dialog';
import { deleteLeague as deleteLeagueAction } from '@/app/actions';

interface LeagueManagementProps {
  leagues: League[];
}

export default function LeagueManagement({ leagues }: LeagueManagementProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="font-headline">League Management</CardTitle>
            <CardDescription>Create new leagues and manage existing ones.</CardDescription>
          </div>
          <CreateLeagueDialog>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Create League
              </Button>
          </CreateLeagueDialog>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>League Name</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leagues.length > 0 ? (
              leagues.map((league) => (
                <TableRow key={league.id}>
                  <TableCell className="font-medium">{league.name}</TableCell>
                  <TableCell>{format(league.createdAt, 'PPP')}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button asChild variant="ghost" size="sm">
                        <Link href={`/admin/leagues/${league.slug}`}>
                          Manage <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={async () => {
                          const ok = window.confirm(`Delete league "${league.name}" and all its teams & matches? This cannot be undone.`);
                          if (!ok) return;
                          try {
                            const res = await deleteLeagueAction(league.id);
                            if (res?.success) {
                              // action triggers revalidation; optionally log
                              console.log('League deleted:', league.id);
                            } else {
                              console.error('Failed to delete league:', res?.error);
                              window.alert('Failed to delete league. See console for details.');
                            }
                          } catch (err) {
                            console.error('Error calling deleteLeague action:', err);
                            window.alert('Unexpected error deleting league. See console.');
                          }
                        }}
                      >
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={3} className="h-24 text-center">
                  No leagues found. Create one to get started.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
