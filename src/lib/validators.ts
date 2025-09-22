import { z } from 'zod';

export const leagueSchema = z.object({
  name: z.string().min(3, 'League name must be at least 3 characters long.'),
});

export const teamSchema = z.object({
  name: z.string().min(2, 'Team name must be at least 2 characters long.'),
  logoURL: z.string().url('Must be a valid URL.'),
});

export const matchSchema = z.object({
    homeTeamId: z.string().min(1, 'Home team is required.'),
    awayTeamId: z.string().min(1, 'Away team is required.'),
    dateTime: z.date({ required_error: 'Match date and time are required.' }),
    homeGoals: z.coerce.number().int().min(0).nullable(),
    awayGoals: z.coerce.number().int().min(0).nullable(),
}).refine(data => data.homeTeamId !== data.awayTeamId, {
    message: "Home and away teams cannot be the same.",
    path: ["awayTeamId"],
});
