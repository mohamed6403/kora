'use server';

/**
 * @fileOverview An AI agent for automating the update of league standings based on match outcomes using an LLM.
 *
 * - automateStandingsUpdates - A function that automates the league standings update process.
 * - AutomateStandingsUpdatesInput - The input type for the automateStandingsUpdates function.
 * - AutomateStandingsUpdatesOutput - The return type for the automateStandingsUpdates function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {updateStandings} from './update-standings';

const AutomateStandingsUpdatesInputSchema = z.object({
  matchResults: z
    .array(
      z.object({
        homeTeam: z.string().describe('The name of the home team.'),
        awayTeam: z.string().describe('The name of the away team.'),
        homeScore: z.number().describe('The score of the home team.'),
        awayScore: z.number().describe('The score of the away team.'),
      })
    )
    .describe('An array of match results to update the standings with.'),
  currentStandings: z
    .array(
      z.object({
        teamName: z.string().describe('The name of the team.'),
        points: z.number().describe('The current total points of the team.'),
        goalDifference: z.number().describe('The current goal difference of the team.'),
        wins: z.number().describe('Number of wins'),
        losses: z.number().describe('Number of losses'),
        draws: z.number().describe('Number of draws'),
      })
    )
    .describe('The current league standings before the match results.'),
  leagueName: z.string().describe('The name of the league.'),
});

export type AutomateStandingsUpdatesInput = z.infer<typeof AutomateStandingsUpdatesInputSchema>;

const AutomateStandingsUpdatesOutputSchema = z.object({
  updatedStandings: z
    .array(
      z.object({
        teamName: z.string().describe('The name of the team.'),
        points: z.number().describe('The updated total points of the team.'),
        goalDifference: z.number().describe('The updated goal difference of the team.'),
        wins: z.number().describe('Number of wins'),
        losses: z.number().describe('Number of losses'),
        draws: z.number().describe('Number of draws'),
      })
    )
    .describe('The updated league standings after processing the match results.'),
});

export type AutomateStandingsUpdatesOutput = z.infer<typeof AutomateStandingsUpdatesOutputSchema>;

export async function automateStandingsUpdates(
  input: AutomateStandingsUpdatesInput
): Promise<AutomateStandingsUpdatesOutput> {
  return automateStandingsUpdatesFlow(input);
}

const automateStandingsUpdatesFlow = ai.defineFlow(
  {
    name: 'automateStandingsUpdatesFlow',
    inputSchema: AutomateStandingsUpdatesInputSchema,
    outputSchema: AutomateStandingsUpdatesOutputSchema,
  },
  async (input) => {
    // Call the existing updateStandings flow to calculate standings based on ALL finished match results.
    // This rebuilds the table from scratch to ensure accuracy.
    const {standings: calculatedStandings} = await updateStandings({matchResults: input.matchResults});

    // Create a map of team names from the original standings to ensure all teams are included,
    // even if they haven't played a match yet.
    const allTeams = new Map<string, any>();
    input.currentStandings.forEach(team => {
        allTeams.set(team.teamName, {
            teamName: team.teamName,
            points: 0,
            goalDifference: 0,
            wins: 0,
            losses: 0,
            draws: 0,
        });
    });

    // Overwrite the zeroed stats with the newly calculated stats for teams that have played.
    calculatedStandings.forEach(team => {
      if (allTeams.has(team.teamName)) {
        allTeams.set(team.teamName, team);
      }
    });

    // Convert the updated standings map back to an array
    const updatedStandings = Array.from(allTeams.values());

    // Sort the final standings by points and then goal difference
    updatedStandings.sort((a: any, b: any) => {
      if (b.points !== a.points) {
        return b.points - a.points;
      }
      return b.goalDifference - a.goalDifference;
    });

    return {updatedStandings: updatedStandings};
  }
);
