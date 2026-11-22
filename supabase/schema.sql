-- =========================================================================
-- STAR MATRIC HR SEC SCHOOL REUNION - SUPABASE DATABASE SCHEMA
-- Includes Row-Level Security (RLS), Realtime replication, and privacy protection
-- =========================================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. REGISTRATIONS TABLE
create table if not exists public.registrations (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  phone text not null unique,
  email text,
  batch text not null,
  guests integer default 0,
  attendance_status text check (attendance_status in ('Yes', 'Maybe', 'No')) default 'Yes',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. FOOD PREFERENCES TABLE
create table if not exists public.food_preferences (
  id uuid primary key default uuid_generate_v4(),
  registration_id uuid references public.registrations(id) on delete cascade,
  attendee_name text not null,
  diet text check (diet in ('Non-veg', 'Veg')) default 'Non-veg',
  spice_level text check (spice_level in ('Mild', 'Medium', 'Spicy')) default 'Medium',
  notes text,
  guests_count integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. POLL OPTIONS & POLL VOTES TABLES
create table if not exists public.poll_options (
  id text primary key,
  question_id text not null,
  text text not null,
  votes integer default 0
);

create table if not exists public.poll_votes (
  id uuid primary key default uuid_generate_v4(),
  question_id text not null,
  option_id text references public.poll_options(id) on delete cascade,
  user_phone_or_device text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (question_id, user_phone_or_device)
);

-- 4. WALL MESSAGES (Sticky notes with moderation)
create table if not exists public.wall_messages (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  message text not null check (char_length(message) <= 140),
  color text default 'yellow',
  hidden boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. BENCH CLAIMS (Classroom seating)
create table if not exists public.bench_claims (
  id uuid primary key default uuid_generate_v4(),
  registration_id uuid references public.registrations(id) on delete set null,
  student_name text not null,
  bench_number integer not null unique check (bench_number between 1 and 40),
  tagline text,
  row_category text check (row_category in ('front', 'middle', 'last')) default 'middle',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6. GAME SCORES (Bell Master Leaderboard)
create table if not exists public.game_scores (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  score integer not null,
  combo integer default 0,
  badge text default 'Bell Master',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 7. EVENT SETTINGS (Locked venue, Admin controls)
create table if not exists public.event_settings (
  id text primary key default 'main',
  locked_venue_id text, -- NULL when poll active, or 'venue-vellu' / 'venue-habbebi'
  total_benches integer default 36,
  batch_name text default 'Class of 2016 - The Trailblazers',
  batch_year text default '2016',
  organizer_name text default 'Kamal & Reunion Committee',
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Seed initial venues into poll_options
insert into public.poll_options (id, question_id, text, votes) values
  ('venue-vellu', 'venue', 'Dindigul Vellu Biriyani Gardens', 28),
  ('venue-habbebi', 'venue', 'Habbebi', 21)
on conflict (id) do nothing;

-- Seed default settings
insert into public.event_settings (id, locked_venue_id, total_benches) values
  ('main', null, 36)
on conflict (id) do nothing;

-- =========================================================================
-- ROW-LEVEL SECURITY (RLS) POLICIES
-- Privacy: Public can insert registrations, votes, notes, claims, scores
-- Public CANNOT see phones or emails of attendees.
-- Admin can view all records.
-- =========================================================================

alter table public.registrations enable row level security;
alter table public.food_preferences enable row level security;
alter table public.poll_options enable row level security;
alter table public.poll_votes enable row level security;
alter table public.wall_messages enable row level security;
alter table public.bench_claims enable row level security;
alter table public.game_scores enable row level security;
alter table public.event_settings enable row level security;

-- Registrations policies:
-- Allow anyone to insert their registration
create policy "Anyone can insert registration" 
  on public.registrations for insert 
  with check (true);

-- Allow public to select anonymized count and public attendance names,
-- but block anonymous select of full details. Authenticated admins can select everything.
create policy "Admins can view all registrations" 
  on public.registrations for select 
  using (auth.role() = 'authenticated');

-- Public view with masked phone/email for live attendee counter
create or replace view public.public_attendees as
  select id, name, batch, attendance_status, created_at
  from public.registrations;

-- Food preferences policies:
create policy "Anyone can insert food preference" 
  on public.food_preferences for insert 
  with check (true);

create policy "Anyone can read food totals" 
  on public.food_preferences for select 
  using (true);

-- Poll options & votes:
create policy "Anyone can read poll options" 
  on public.poll_options for select 
  using (true);

create policy "Anyone can insert poll vote" 
  on public.poll_votes for insert 
  with check (true);

-- Wall messages:
create policy "Anyone can insert wall message" 
  on public.wall_messages for insert 
  with check (true);

create policy "Anyone can read unhidden wall messages" 
  on public.wall_messages for select 
  using (hidden = false or auth.role() = 'authenticated');

create policy "Admins can update wall messages" 
  on public.wall_messages for update 
  using (auth.role() = 'authenticated');

create policy "Admins can delete wall messages" 
  on public.wall_messages for delete 
  using (auth.role() = 'authenticated');

-- Bench claims:
create policy "Anyone can insert bench claim" 
  on public.bench_claims for insert 
  with check (true);

create policy "Anyone can read bench claims" 
  on public.bench_claims for select 
  using (true);

-- Game scores:
create policy "Anyone can insert game score" 
  on public.game_scores for insert 
  with check (true);

create policy "Anyone can read top game scores" 
  on public.game_scores for select 
  using (true);

-- Event settings:
create policy "Anyone can read event settings" 
  on public.event_settings for select 
  using (true);

create policy "Admins can update event settings" 
  on public.event_settings for update 
  using (auth.role() = 'authenticated');

-- Enable Realtime for live counters and updates
alter publication supabase_realtime add table public.registrations;
alter publication supabase_realtime add table public.poll_options;
alter publication supabase_realtime add table public.food_preferences;
alter publication supabase_realtime add table public.wall_messages;
alter publication supabase_realtime add table public.bench_claims;
alter publication supabase_realtime add table public.game_scores;
alter publication supabase_realtime add table public.event_settings;
