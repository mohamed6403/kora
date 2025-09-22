'use server';

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
    throw new Error('Missing SUPABASE_URL in environment for server client.');
}

if (!serviceRoleKey) {
    // Do not throw here to allow environments without service role; but warn for writes.
    console.warn('SUPABASE_SERVICE_ROLE_KEY is not set. Server-side privileged operations will fail.');
}

export const supabaseServer = createClient(supabaseUrl, serviceRoleKey ?? '');
export default supabaseServer;


