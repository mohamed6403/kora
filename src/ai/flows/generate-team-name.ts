'use server';

/**
 * @fileOverview A team name generator AI agent.
 *
 * - generateTeamName - A function that handles the team name generation process.
 * - GenerateTeamNameInput - The input type for the generateTeamName function.
 * - GenerateTeamNameOutput - The return type for the generateTeamName function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateTeamNameInputSchema = z.object({
  leagueName: z.string().describe('The name of the league.'),
});

export type GenerateTeamNameInput = z.infer<typeof GenerateTeamNameInputSchema>;

const GenerateTeamNameOutputSchema = z.object({
  teamName: z.string().describe('The generated team name.'),
});

export type GenerateTeamNameOutput = z.infer<typeof GenerateTeamNameOutputSchema>;

export async function generateTeamName(input: GenerateTeamNameInput): Promise<GenerateTeamNameOutput> {
  return generateTeamNameFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateTeamNamePrompt',
  input: {schema: GenerateTeamNameInputSchema},
  output: {schema: GenerateTeamNameOutputSchema},
  prompt: `You are a creative team name generator for sports leagues.

  Generate a unique and catchy team name suitable for a football team participating in the {{{leagueName}}} league.
  The team name should be exciting and memorable.
  Ensure the generated name is not already in use within a major sports league.
  Output only the generated team name.`,
});

const generateTeamNameFlow = ai.defineFlow(
  {
    name: 'generateTeamNameFlow',
    inputSchema: GenerateTeamNameInputSchema,
    outputSchema: GenerateTeamNameOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
