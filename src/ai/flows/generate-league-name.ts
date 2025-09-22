'use server';

/**
 * @fileOverview An AI agent for generating league names.
 *
 * - generateLeagueName - A function that generates a league name.
 * - GenerateLeagueNameInput - The input type for the generateLeagueName function.
 * - GenerateLeagueNameOutput - The return type for the generateLeagueName function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateLeagueNameInputSchema = z.object({
  sport: z.string().describe('The sport the league is for, e.g. Football, Basketball, Soccer'),
  country: z.string().describe('The country or region the league is based in, e.g. USA, UK, Europe'),
});
export type GenerateLeagueNameInput = z.infer<typeof GenerateLeagueNameInputSchema>;

const GenerateLeagueNameOutputSchema = z.object({
  leagueName: z.string().describe('The generated name of the league.'),
});
export type GenerateLeagueNameOutput = z.infer<typeof GenerateLeagueNameOutputSchema>;

export async function generateLeagueName(input: GenerateLeagueNameInput): Promise<GenerateLeagueNameOutput> {
  return generateLeagueNameFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateLeagueNamePrompt',
  input: {schema: GenerateLeagueNameInputSchema},
  output: {schema: GenerateLeagueNameOutputSchema},
  prompt: `You are an expert league name generator.

  Generate a creative and appropriate name for a {{sport}} league based in {{country}}.
  The name should be unique and appealing to fans.
  Name:`,
});

const generateLeagueNameFlow = ai.defineFlow(
  {
    name: 'generateLeagueNameFlow',
    inputSchema: GenerateLeagueNameInputSchema,
    outputSchema: GenerateLeagueNameOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
