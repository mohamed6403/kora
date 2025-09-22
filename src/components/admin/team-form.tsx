'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { teamSchema } from '@/lib/validators';
import type { z } from 'zod';
import type { Team } from '@/types';
import { addTeam, updateTeam } from '@/app/actions';
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
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';


interface TeamFormProps {
    open: boolean;
    setOpen: (open: boolean) => void;
    leagueId: string;
    leagueName: string;
    team: Team | null;
}

type TeamFormValues = z.infer<typeof teamSchema>;

export default function TeamForm({ open, setOpen, leagueId, leagueName, team }: TeamFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const isEditMode = !!team;

  const form = useForm<TeamFormValues>({
    resolver: zodResolver(teamSchema),
    defaultValues: {
      name: '',
      logoURL: '',
    },
  });

  useEffect(() => {
    if (team) {
      form.reset({
        name: team.name,
        logoURL: team.logoURL,
      });
    } else {
      // Corrected to use a picsum.photos URL with a random seed
      const randomSeed = Math.floor(Math.random() * 1000);
      form.reset({
        name: '',
        logoURL: `https://picsum.photos/seed/${randomSeed}/200`,
      });
    }
  }, [team, form, open]);
  
  const onSubmit = async (data: TeamFormValues) => {
    setIsSubmitting(true);
    const result = isEditMode
      ? await updateTeam(leagueId, team.id, data)
      : await addTeam(leagueId, data);
    setIsSubmitting(false);

    if (result.success) {
      toast({ title: 'Success', description: `Team ${isEditMode ? 'updated' : 'added'} successfully.` });
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
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Edit Team' : 'Add New Team'}</DialogTitle>
          <DialogDescription>
            {isEditMode ? 'Update the details for this team.' : 'Fill in the details for the new team.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Team Name</FormLabel>
                   <FormControl>
                      <Input placeholder="e.g. Manchester United" {...field} />
                    </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="logoURL"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Logo URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://example.com/logo.png" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditMode ? 'Save Changes' : 'Add Team'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
