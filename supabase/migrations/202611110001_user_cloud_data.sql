-- User-owned cloud data shared by the Kuda Sebet app and website.
-- All user tables use RLS and are accessible only to their authenticated owner.

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null default '',
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.favorites (
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  product_id text not null,
  created_at timestamptz not null default now(),
  primary key (user_id, product_id)
);

create table if not exists public.birthdays (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name text not null check (char_length(trim(name)) between 1 and 80),
  birthday date not null,
  reminder_days_before smallint not null default 3 check (reminder_days_before between 0 and 30),
  enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists birthdays_user_id_idx on public.birthdays (user_id);

alter table public.profiles enable row level security;
alter table public.favorites enable row level security;
alter table public.birthdays enable row level security;

revoke all on table public.profiles from anon, authenticated;
revoke all on table public.favorites from anon, authenticated;
revoke all on table public.birthdays from anon, authenticated;
grant select, insert, update, delete on table public.profiles to authenticated;
grant select, insert, update, delete on table public.favorites to authenticated;
grant select, insert, update, delete on table public.birthdays to authenticated;

drop policy if exists "profile owner can read" on public.profiles;
create policy "profile owner can read" on public.profiles
  for select to authenticated using ((select auth.uid()) = id);
drop policy if exists "profile owner can insert" on public.profiles;
create policy "profile owner can insert" on public.profiles
  for insert to authenticated with check ((select auth.uid()) = id);
drop policy if exists "profile owner can update" on public.profiles;
create policy "profile owner can update" on public.profiles
  for update to authenticated using ((select auth.uid()) = id) with check ((select auth.uid()) = id);
drop policy if exists "profile owner can delete" on public.profiles;
create policy "profile owner can delete" on public.profiles
  for delete to authenticated using ((select auth.uid()) = id);

drop policy if exists "users manage own favorites" on public.favorites;
create policy "users manage own favorites" on public.favorites
  for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "users manage own birthdays" on public.birthdays;
create policy "users manage own birthdays" on public.birthdays
  for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_touch_updated_at on public.profiles;
create trigger profiles_touch_updated_at before update on public.profiles
  for each row execute function public.touch_updated_at();
drop trigger if exists birthdays_touch_updated_at on public.birthdays;
create trigger birthdays_touch_updated_at before update on public.birthdays
  for each row execute function public.touch_updated_at();
