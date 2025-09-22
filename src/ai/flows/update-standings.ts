'use server';

/**
 * @fileOverview An AI agent for automatically updating league standings based on match results.
 *
 * - updateStandings - A function that updates the league standings.
 * - UpdateStandingsInput - The input type for the updateStandings function.
 * - UpdateStandingsOutput - The return type for the updateStandings function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const UpdateStandingsInputSchema = z.object({
  matchResults: z
    .array(
      z.object({
        homeTeam: z.string().describe('The name of the home team.'),
        awayTeam: z.string().describe('The name of the away team.'),
        homeScore: z.number().describe('The score of the home team.'),
        awayScore: z.number().describe('The score of the away team.'),
      })
    )
    .describe('An array of match results.'),
});

export type UpdateStandingsInput = z.infer<typeof UpdateStandingsInputSchema>;

const UpdateStandingsOutputSchema = z.object({
  standings: z
    .array(
      z.object({
        teamName: z.string().describe('The name of the team.'),
        points: z.number().describe('The total points of the team.'),
        goalDifference: z.number().describe('The goal difference of the team.'),
        wins: z.number().describe('Number of wins'),
        losses: z.number().describe('Number of losses'),
        draws: z.number().describe('Number of draws'),
      })
    )
    .describe('The updated league standings.'),
});

export type UpdateStandingsOutput = z.infer<typeof UpdateStandingsOutputSchema>;

export async function updateStandings(input: UpdateStandingsInput): Promise<UpdateStandingsOutput> {
  return updateStandingsFlow(input);
}

const updateStandingsFlow = ai.defineFlow(
  {
    name: 'updateStandingsFlow',
    inputSchema: UpdateStandingsInputSchema,
    outputSchema: UpdateStandingsOutputSchema,
  },
  async input => {
    const standingsMap: {[teamName: string]: {
      points: number;
      goalDifference: number;
      wins: number;
      losses: number;
      draws: number;
    }} = {};

    // Initialize standings for each team
    input.matchResults.forEach(match => {
      if (!standingsMap[match.homeTeam]) {
        standingsMap[match.homeTeam] = {points: 0, goalDifference: 0, wins: 0, losses: 0, draws: 0};
      }
      if (!standingsMap[match.awayTeam]) {
        standingsMap[match.awayTeam] = {points: 0, goalDifference: 0, wins: 0, losses: 0, draws: 0};
      }
    });

    // Update standings based on match results
    input.matchResults.forEach(match => {
      const homeTeam = match.homeTeam;
      const awayTeam = match.awayTeam;
      const homeScore = match.homeScore;
      const awayScore = match.awayScore;

      standingsMap[homeTeam].goalDifference += homeScore - awayScore;
      standingsMap[awayTeam].goalDifference += awayScore - homeScore;

      if (homeScore > awayScore) {
        standingsMap[homeTeam].points += 3;
        standingsMap[homeTeam].wins += 1;
        standingsMap[awayTeam].losses += 1;
      } else if (homeScore < awayScore) {
        standingsMap[awayTeam].points += 3;
        standingsMap[awayTeam].wins += 1;
        standingsMap[homeTeam].losses += 1;
      } else {
        standingsMap[homeTeam].points += 1;
        standingsMap[awayTeam].points += 1;
        standingsMap[homeTeam].draws += 1;
        standingsMap[awayTeam].draws += 1;
      }
    });

    // Convert the standings map to an array
    const standings = Object.entries(standingsMap).map(([teamName, data]) => ({
      teamName: teamName,
      points: data.points,
      goalDifference: data.goalDifference,
      wins: data.wins,
      losses: data.losses,
      draws: data.draws,
    }));

    // Sort the standings by points and then goal difference
    standings.sort((a, b) => {
      if (b.points !== a.points) {
        return b.points - a.points;
      }
      return b.goalDifference - a.goalDifference;
    });

    return {standings: standings};
  }
);

