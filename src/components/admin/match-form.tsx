'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { matchSchema } from '@/lib/validators';
import type { z } from 'zod';
import type { Match, Team } from '@/types';
import { addMatch, updateMatch } from '@/app/actions';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

interface MatchFormProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  leagueId: string;
  teams: Team[];
  match: Match | null;
}

type MatchFormValues = z.infer<typeof matchSchema>;

export default function MatchForm({ open, setOpen, leagueId, teams, match }: MatchFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const isEditMode = !!match;

  const form = useForm<MatchFormValues>({
    resolver: zodResolver(matchSchema),
    defaultValues: {
      homeTeamId: '',
      awayTeamId: '',
      dateTime: new Date(),
      homeGoals: null,
      awayGoals: null,
    },
  });

  useEffect(() => {
    if (match) {
      form.reset({
        homeTeamId: match.homeTeamId,
        awayTeamId: match.awayTeamId,
        dateTime: match.dateTime, // Already a Date object
        homeGoals: match.homeGoals,
        awayGoals: match.awayGoals,
      });
    } else {
      form.reset({
        homeTeamId: '',
        awayTeamId: '',
        dateTime: new Date(),
        homeGoals: null,
        awayGoals: null,
      });
    }
  }, [match, form, open]);

  const onSubmit = async (data: MatchFormValues) => {
    setIsSubmitting(true);
    const result = isEditMode
      ? await updateMatch(leagueId, match.id, data)
      : await addMatch(leagueId, data);
    setIsSubmitting(false);

    if (result.success) {
      toast({ title: 'Success', description: `Match ${isEditMode ? 'updated' : 'added'} successfully.` });
      setOpen(false);
    } else {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: result.error || 'An error occurred.',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Edit Match' : 'Add New Match'}</DialogTitle>
          <DialogDescription>
            {isEditMode ? 'Update the details for this match.' : 'Fill in the details for the new match.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="homeTeamId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Home Team</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger><SelectValue placeholder="Select a team" /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {teams.map(team => <SelectItem key={team.id} value={team.id}>{team.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="awayTeamId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Away Team</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger><SelectValue placeholder="Select a team" /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {teams.map(team => <SelectItem key={team.id} value={team.id}>{team.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="dateTime"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Date & Time</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn('pl-3 text-left font-normal', !field.value && 'text-muted-foreground')}
                        >
                          {field.value ? format(field.value, 'PPP') : <span>Pick a date</span>}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="homeGoals"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Home Goals</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="-"
                        {...field}
                        value={field.value ?? ''}
                        onChange={e => {
                          const v = e.target.value;
                          field.onChange(v === '' ? null : Number(v));
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="awayGoals"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Away Goals</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="-"
                        {...field}
                        value={field.value ?? ''}
                        onChange={e => {
                          const v = e.target.value;
                          field.onChange(v === '' ? null : Number(v));
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditMode ? 'Save Changes' : 'Add Match'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
