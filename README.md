# Football League Management App

Public pages show leagues, teams, and standings. Admin pages allow creating leagues, teams, and matches. Supabase provides Postgres, Auth, and Realtime. Genkit AI flows assist with name generation and standings updates.

## Environment

Create `.env.local` in the project root:

```
SUPABASE_URL=your-url
SUPABASE_ANON_KEY=your-anon-key
# Optional for server-only privileged writes
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

Clients:
- Client-side: `src/lib/supabase-client.ts`
- Server-only: `src/lib/supabase-server.ts`

Apply RLS policies from `supabase-policies.sql` and adjust claims for admin writes.
