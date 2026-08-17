# Phase 4 Supabase setup

AI Inbox uses the browser Supabase client with an invisible anonymous user session. It never requires a service-role key.

## Dashboard setup

1. Open **Authentication → Providers → Anonymous Sign-Ins** and enable anonymous sign-ins.
2. Open **SQL Editor**, paste `migrations/202608120001_phase4_persistence.sql`, and run it once.
3. Confirm **Storage → screenshots** exists and is private. The SQL creates it with a 10 MB limit and PNG/JPEG/WEBP MIME restrictions.
4. Add the project URL and anon/publishable key to `.env.local` and to the Vercel project environment:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
   ```

5. Restart the local Next.js development server after changing `.env.local`.

The migration enables RLS on `inbox_items` and limits database rows and Storage objects to `auth.uid()`. Screenshot objects use `{user_id}/{item_id}.{extension}` paths.

## Phase 5.1 saved items

After the Phase 4 setup, run `migrations/202608140001_saved_items.sql` once in the SQL Editor. It creates the RLS-protected `saved_items` table used by the Inbox Save button and Saved page.

## Phase 5.3.2 reminders

Run `migrations/202608140002_create_reminders.sql` once in the SQL Editor after the Phase 4 migration. It creates `public.reminders` with:

- an optional link to the originating `inbox_items` row;
- a required reminder title and `remind_at` timestamp;
- `pending` and `completed` statuses;
- indexes for user, due-time, and user/status queries;
- RLS policies allowing authenticated users to select, insert, update, and delete only rows whose `user_id` matches `auth.uid()`.

This migration only creates the persistence foundation. It does not add reminder UI, action execution, notifications, or an API route. The migration must be applied manually in the Supabase SQL Editor before application code can use the table.
