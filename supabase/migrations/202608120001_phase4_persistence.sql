-- AI Inbox Phase 4 persistence setup.
-- Run this once in the Supabase SQL Editor after enabling Anonymous Sign-Ins.

create extension if not exists pgcrypto;

create table if not exists public.inbox_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  image_path text,
  intent text not null check (intent in ('shop', 'go', 'do', 'attend', 'remember', 'other')),
  title text not null,
  summary text,
  confidence numeric,
  structured_data jsonb not null default '{}'::jsonb,
  status text not null default 'new' check (status in ('new', 'saved', 'todo', 'done', 'archived')),
  reminder_at timestamptz null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists inbox_items_user_created_idx
  on public.inbox_items (user_id, created_at desc);

alter table public.inbox_items enable row level security;

revoke all on public.inbox_items from anon;
grant select, insert, update, delete on public.inbox_items to authenticated;

drop policy if exists "Users can insert their own inbox items" on public.inbox_items;
create policy "Users can insert their own inbox items"
  on public.inbox_items for insert to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "Users can select their own inbox items" on public.inbox_items;
create policy "Users can select their own inbox items"
  on public.inbox_items for select to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "Users can update their own inbox items" on public.inbox_items;
create policy "Users can update their own inbox items"
  on public.inbox_items for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "Users can delete their own inbox items" on public.inbox_items;
create policy "Users can delete their own inbox items"
  on public.inbox_items for delete to authenticated
  using ((select auth.uid()) = user_id);

create or replace function public.set_inbox_item_updated_at()
returns trigger language plpgsql set search_path = '' as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_inbox_items_updated_at on public.inbox_items;
create trigger set_inbox_items_updated_at
  before update on public.inbox_items
  for each row execute function public.set_inbox_item_updated_at();

-- Create the private Storage bucket if it does not exist.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('screenshots', 'screenshots', false, 10485760, array['image/png', 'image/jpeg', 'image/webp'])
on conflict (id) do update set
  public = false,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Users can upload screenshots to their folder" on storage.objects;
create policy "Users can upload screenshots to their folder"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'screenshots'
    and (storage.foldername(name))[1] = (select auth.uid()::text)
  );

drop policy if exists "Users can read screenshots in their folder" on storage.objects;
create policy "Users can read screenshots in their folder"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'screenshots'
    and (storage.foldername(name))[1] = (select auth.uid()::text)
  );

drop policy if exists "Users can update screenshots in their folder" on storage.objects;
create policy "Users can update screenshots in their folder"
  on storage.objects for update to authenticated
  using (
    bucket_id = 'screenshots'
    and (storage.foldername(name))[1] = (select auth.uid()::text)
  )
  with check (
    bucket_id = 'screenshots'
    and (storage.foldername(name))[1] = (select auth.uid()::text)
  );

drop policy if exists "Users can delete screenshots in their folder" on storage.objects;
create policy "Users can delete screenshots in their folder"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'screenshots'
    and (storage.foldername(name))[1] = (select auth.uid()::text)
  );
