# 🚀 Supabase Setup Guide

## Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click "Start your project" and sign up/login
3. Click "New Project"
4. Choose your organization
5. Fill in project details:
   - **Name**: `sports-league-app` (or any name you prefer)
   - **Database Password**: Create a strong password (save this!)
   - **Region**: Choose closest to your users
6. Click "Create new project"
7. Wait 2-3 minutes for setup to complete

## Step 2: Get Your Project Credentials

1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy these values:
   - **Project URL** (looks like: `https://your-project-id.supabase.co`)
   - **Anon public key** (starts with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`)

## Step 3: Set Up Environment Variables

1. In your project root, create a file called `.env.local`
2. Add your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Replace the values with your actual credentials from Step 2**

## Step 4: Set Up Database Schema

1. In your Supabase dashboard, go to **SQL Editor**
2. Click "New query"
3. Copy the contents of `supabase-schema.sql` (in your project root)
4. Paste it into the SQL editor
5. Click "Run" to execute the schema

This will create:
- ✅ `leagues` table
- ✅ `teams` table  
- ✅ `matches` table
- ✅ Sample data (Local Premier League with 4 teams)
- ✅ Real-time subscriptions enabled

## Step 5: Test the Connection

1. Restart your development server:
   ```bash
   npm run dev
   ```
2. Open your app at `http://localhost:3000`
3. You should see the "Local Premier League" with 4 teams
4. Try creating a new league or team - it should work!

## Step 6: Enable Real-time Updates

The real-time features are already built into the new database service. When you:
- Add a new team → All users see it instantly
- Update match results → Standings update everywhere
- Create a new match → It appears on all devices

## 🎉 You're Done!

Your app now has:
- ✅ **Centralized database** - data stored in the cloud
- ✅ **Real-time updates** - changes appear instantly across all devices
- ✅ **Scalable** - can handle many users
- ✅ **Secure** - built-in authentication ready

## Next Steps (Optional)

1. **Add Authentication**: Set up user login in Supabase
2. **File Storage**: Store team logos in Supabase Storage
3. **Email Notifications**: Send match updates via email
4. **Mobile App**: Use the same database for a mobile app

## Troubleshooting

**"Invalid API key" error?**
- Check your `.env.local` file has the correct credentials
- Make sure there are no extra spaces or quotes

**"Table doesn't exist" error?**
- Run the SQL schema again in Supabase SQL Editor
- Check the table names match exactly

**Real-time not working?**
- Make sure you're using the new database functions
- Check browser console for errors

## Need Help?

- [Supabase Documentation](https://supabase.com/docs)
- [Next.js + Supabase Guide](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)
