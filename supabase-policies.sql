-- Enable RLS on core tables
alter table if exists public.leagues enable row level security;
alter table if exists public.teams enable row level security;
alter table if exists public.matches enable row level security;

-- Roles: authenticated users can read; only admins can write
-- Admin detection via JWT claim 'role' = 'admin' (set via Supabase Auth Hooks or custom claim)

create policy if not exists "read leagues for authenticated" on public.leagues
for select to authenticated using (true);

create policy if not exists "read teams for authenticated" on public.teams
for select to authenticated using (true);

create policy if not exists "read matches for authenticated" on public.matches
for select to authenticated using (true);

-- Example admin-only write policies
create policy if not exists "write leagues for admin" on public.leagues
for all to authenticated using (
  coalesce((auth.jwt() ->> 'role')::text, '') = 'admin'
) with check (
  coalesce((auth.jwt() ->> 'role')::text, '') = 'admin'
);

create policy if not exists "write teams for admin" on public.teams
for all to authenticated using (
  coalesce((auth.jwt() ->> 'role')::text, '') = 'admin'
) with check (
  coalesce((auth.jwt() ->> 'role')::text, '') = 'admin'
);

create policy if not exists "write matches for admin" on public.matches
for all to authenticated using (
  coalesce((auth.jwt() ->> 'role')::text, '') = 'admin'
) with check (
  coalesce((auth.jwt() ->> 'role')::text, '') = 'admin'
);

-- Optional: allow public read for unauthenticated visitors
grant usage on schema public to anon;
grant select on public.leagues, public.teams, public.matches to anon;


