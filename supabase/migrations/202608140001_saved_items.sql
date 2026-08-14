-- AI Inbox Phase 5.1 saved items.
-- Run this once in the Supabase SQL Editor after the Phase 4 migration.

create table if not exists public.saved_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  inbox_item_id uuid not null references public.inbox_items(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, inbox_item_id)
);

create index if not exists saved_items_user_created_idx
  on public.saved_items (user_id, created_at desc);

alter table public.saved_items enable row level security;

revoke all on public.saved_items from anon;
grant select, insert, delete on public.saved_items to authenticated;

drop policy if exists "Users can insert their own saved items" on public.saved_items;
create policy "Users can insert their own saved items"
  on public.saved_items for insert to authenticated
  with check (
    (select auth.uid()) = user_id
    and exists (
      select 1 from public.inbox_items
      where inbox_items.id = saved_items.inbox_item_id
        and inbox_items.user_id = (select auth.uid())
    )
  );

drop policy if exists "Users can select their own saved items" on public.saved_items;
create policy "Users can select their own saved items"
  on public.saved_items for select to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "Users can delete their own saved items" on public.saved_items;
create policy "Users can delete their own saved items"
  on public.saved_items for delete to authenticated
  using ((select auth.uid()) = user_id);
