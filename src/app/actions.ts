'use client';
/**
 * This file contains client-side data manipulation functions that interact
 * with the localStorage database (`local-storage-db.ts`).
 * They mimic the behavior of Next.js Server Actions for a local-only environment.
 */
import type { z } from 'zod';
import type { teamSchema, matchSchema, leagueSchema } from '@/lib/validators';
import { automateStandingsUpdates, type AutomateStandingsUpdatesInput } from '@/ai/flows/automate-standings-updates';
import * as db from '@/lib/supabase-db';

// Helper to create a URL-friendly slug
const createSlug = (name: string) => {
  return name
    .toLowerCase()
    .replace(/ /g, '-')
    .replace(/[^\w-]+/g, '');
};

// This function will be called by components to trigger a re-render.
// In a real app with state management, this would be more sophisticated.
const triggerRevalidation = () => {
    // A simple way to signal data has changed is to use a custom event.
    // Components can listen for this to refresh their state.
    window.dispatchEvent(new Event('data-changed'));
}

// AI Standings Automation Action
export async function runAutomateStandingsUpdate(leagueId: string, leagueName: string) {
  try {
    const teamsData = await db.getTeamsByLeagueId(leagueId);
    const matchesData = await db.getMatchesByLeagueId(leagueId);

    const currentStandings = teamsData.map(team => ({
      teamName: team.name,
      points: Number(team.points) || 0,
      goalDifference: Number(team.goalDifference) || 0,
      wins: Number(team.wins) || 0,
      losses: Number(team.losses) || 0,
      draws: Number(team.draws) || 0,
    }));

    const finishedMatches = matchesData.filter(m => m.status === 'finished');
    
    const matchResults = await Promise.all(
      finishedMatches
        .filter(match => match.homeScore !== null && match.awayScore !== null)
        .map(async match => {
          const homeTeam = await db.getTeamById(match.homeTeamId);
          const awayTeam = await db.getTeamById(match.awayTeamId);
          return {
            homeTeam: homeTeam?.name || 'Unknown Team',
            awayTeam: awayTeam?.name || 'Unknown Team',
            homeScore: match.homeScore,
            awayScore: match.awayScore,
          };
        })
    );

    if (matchResults.length === 0) {
      return { success: false, error: "No finished matches to process." };
    }

    const input: AutomateStandingsUpdatesInput = {
      leagueName,
      currentStandings,
      matchResults,
    };
    
    // The AI flow is still a server component, so this will make a network request.
    const result = await automateStandingsUpdates(input);

    if (!result || !result.updatedStandings) {
        throw new Error("AI flow did not return the expected output.");
    }
    
    const { updatedStandings } = result;
    
    for (const teamStanding of updatedStandings) {
      const team = teamsData.find(t => t.name === teamStanding.teamName);
      if (team) {
        // Calculate played, goalsFor, goalsAgainst locally
        const stats = { played: 0, goalsFor: 0, goalsAgainst: 0 };
        finishedMatches.forEach(match => {
            if (match.homeTeamId === team.id) {
                stats.played++;
                stats.goalsFor += match.homeScore!;
                stats.goalsAgainst += match.awayScore!;
            } else if (match.awayTeamId === team.id) {
                stats.played++;
                stats.goalsFor += match.awayScore!;
                stats.goalsAgainst += match.homeScore!;
            }
        });

        await db.updateTeamInLeague(team.id, {
            points: teamStanding.points,
            goalDifference: teamStanding.goalDifference,
            wins: teamStanding.wins,
            losses: teamStanding.losses,
            draws: teamStanding.draws,
            played: stats.played,
            goalsFor: stats.goalsFor,
            goalsAgainst: stats.goalsAgainst,
        });
      }
    }

    triggerRevalidation();
    return { success: true };
  } catch (error) {
    console.error('Error automating standings update:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return { success: false, error: `Failed to update standings using AI: ${errorMessage}` };
  }
}

// League Actions
export async function createLeague(values: z.infer<typeof leagueSchema>) {
  try {
    const slug = createSlug(values.name);
    await db.addLeague({
      name: values.name,
      sport: "Football",
      country: "Global",
      slug,
    });
    triggerRevalidation();
    return { success: true };
  } catch (error) {
    console.error('Error creating league:', error);
    return { success: false, error: 'Failed to create league.' };
  }
}

// Team Actions
export async function addTeam(leagueId: string, values: z.infer<typeof teamSchema>) {
  try {
    await db.addTeamToLeague(leagueId, values);
    triggerRevalidation();
    return { success: true };
  } catch (error) {
    console.error('Error adding team:', error);
    return { success: false, error: 'Failed to add team.' };
  }
}

export async function updateTeam(leagueId: string, teamId: string, values: z.infer<typeof teamSchema>) {
  try {
    await db.updateTeamInLeague(teamId, values);
    triggerRevalidation();
    return { success: true };
  } catch (error) {
    console.error('Error updating team:', error);
    return { success: false, error: 'Failed to update team.' };
  }
}

export async function deleteTeam(leagueId: string, teamId: string) {
  try {
    await db.deleteTeamFromLeague(teamId);
    triggerRevalidation();
    return { success: true };
  } catch (error) {
    console.error('Error deleting team:', error);
    return { success: false, error: 'Failed to delete team.' };
  }
}

// Match Actions
export async function addMatch(leagueId: string, values: z.infer<typeof matchSchema>) {
  try {
    const { homeTeamId, awayTeamId, homeGoals, awayGoals, dateTime } = values;
    const status = homeGoals !== null && awayGoals !== null && homeGoals >= 0 && awayGoals >= 0 ? 'finished' : 'scheduled';
    
    await db.addMatchToLeague(leagueId, {
      homeTeamId,
      awayTeamId,
      dateTime,
      homeScore: homeGoals,
      awayScore: awayGoals,
      status,
    });

    triggerRevalidation();
    return { success: true };
  } catch (error) {
    console.error('Error adding match:', error);
    return { success: false, error: 'Failed to add match.' };
  }
}

export async function updateMatch(leagueId: string, matchId: string, values: z.infer<typeof matchSchema>) {
    try {
        const { homeTeamId, awayTeamId, homeGoals, awayGoals, dateTime } = values;
        const status = (homeGoals !== null && awayGoals !== null && homeGoals >= 0 && awayGoals >= 0) ? 'finished' : 'scheduled';

        await db.updateMatchInLeague(matchId, {
            homeTeamId,
            awayTeamId,
            dateTime,
            homeScore: homeGoals,
            awayScore: awayGoals,
            status,
        });

        triggerRevalidation();
        return { success: true };
    } catch (error) {
        console.error('Error updating match:', error);
        return { success: false, error: 'Failed to update match.' };
    }
}


export async function deleteMatch(leagueId: string, matchId: string) {
    try {
        await db.deleteMatchFromLeague(matchId);
        triggerRevalidation();
        return { success: true };
    } catch (error) {
        console.error('Error deleting match:', error);
        return { success: false, error: 'Failed to delete match.' };
    }
}
