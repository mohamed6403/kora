import { config } from 'dotenv';
config();

import '@/ai/flows/generate-league-name.ts';
import '@/ai/flows/generate-team-name.ts';
import '@/ai/flows/update-standings.ts';
import '@/ai/flows/automate-standings-updates.ts';