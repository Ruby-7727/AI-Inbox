-- AI Inbox Phase 5.3.2 reminder persistence foundation.
-- Run this once in the Supabase SQL Editor after the Phase 4 migration.

create table if not exists public.reminders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  inbox_item_id uuid references public.inbox_items(id) on delete cascade,
  title text not null,
  description text,
  remind_at timestamptz not null,
  status text not null default 'pending' constraint reminders_status_check check (status in ('pending', 'completed')),
  created_at timestamptz not null default now()
);

create index if not exists reminders_user_id_idx
  on public.reminders (user_id);

create index if not exists reminders_remind_at_idx
  on public.reminders (remind_at);

create index if not exists reminders_user_status_idx
  on public.reminders (user_id, status);

alter table public.reminders enable row level security;

revoke all on public.reminders from anon;
grant select, insert, update, delete on public.reminders to authenticated;

drop policy if exists "Users can select their own reminders" on public.reminders;
create policy "Users can select their own reminders"
  on public.reminders for select to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "Users can insert their own reminders" on public.reminders;
create policy "Users can insert their own reminders"
  on public.reminders for insert to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "Users can update their own reminders" on public.reminders;
create policy "Users can update their own reminders"
  on public.reminders for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "Users can delete their own reminders" on public.reminders;
create policy "Users can delete their own reminders"
  on public.reminders for delete to authenticated
  using ((select auth.uid()) = user_id);
