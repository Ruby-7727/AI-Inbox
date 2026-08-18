-- AI Inbox Phase 6.2 saved item categories.
-- Run this once after 202608140001_saved_items.sql.

alter table public.saved_items
  add column if not exists category text;

update public.saved_items
set category = 'note'
where category is null;

alter table public.saved_items
  alter column category set default 'note',
  alter column category set not null;

alter table public.saved_items
  drop constraint if exists saved_items_category_check;

alter table public.saved_items
  add constraint saved_items_category_check
  check (category in ('product', 'place', 'note'));
