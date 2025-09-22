'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { supabaseServer } from '@/lib/supabase-server';

const InputSchema = z.object({
    sport: z.string().min(2),
    country: z.string().min(2),
});

const OutputSchema = z.object({
    id: z.string(),
    name: z.string(),
    slug: z.string(),
});

function slugify(name: string): string {
    return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

const namePrompt = ai.definePrompt({
    name: 'createLeagueNamePrompt',
    input: { schema: InputSchema },
    output: { schema: z.object({ leagueName: z.string() }) },
    prompt: `You generate short, unique league names.
Given a {{sport}} league in {{country}}, output JSON {"leagueName": "..."} with a concise, brandable name.`,
});

export type CreateLeagueWithAiInput = z.infer<typeof InputSchema>;
export type CreateLeagueWithAiOutput = z.infer<typeof OutputSchema>;

export const createLeagueWithAi = ai.defineFlow(
    { name: 'createLeagueWithAi', inputSchema: InputSchema, outputSchema: OutputSchema },
    async (input) => {
        const { output } = await namePrompt(input);
        const name = output!.leagueName;
        const slug = slugify(name);

        // Insert into Supabase using server role
        const { data, error } = await supabaseServer
            .from('leagues')
            .insert({ name, slug, sport: input.sport, country: input.country })
            .select('*')
            .single();

        if (error) {
            throw new Error(`Failed to insert league: ${error.message}`);
        }

        return { id: String(data.id), name: data.name, slug: data.slug };
    }
);


