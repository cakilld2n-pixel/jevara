-- 0001_profiles — JEVARA profiles + RLS (Auth seam, ticket 03)
-- Foundation: anon guest + email OTP, RLS user_id = auth.uid()

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text,
  goal text check (goal in ('recomp','muscle','fatloss','strength','fitness','')),
  experience text check (experience in ('beginner','intermediate','advanced','')),
  days int check (days between 2 and 7),
  equipment text,
  focus text,
  avoid text,
  recommended_program text,
  onboarded boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.profiles enable row level security;

drop policy if exists "profiles_owner_all" on public.profiles;
create policy "profiles_owner_all"
  on public.profiles for all
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- updated_at trigger
create or replace function public.handle_profiles_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end; $$;

drop trigger if exists trg_profiles_updated_at on public.profiles;
create trigger trg_profiles_updated_at
  before update on public.profiles
  for each row execute function public.handle_profiles_updated_at();
