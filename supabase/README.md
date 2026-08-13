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
