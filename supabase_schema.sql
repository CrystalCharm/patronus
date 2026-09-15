-- ==============================================================================
-- PATRONUS REAL-TIME DATABASE SCHEMA (SUPABASE POSTGRESQL)
-- Run this script in the Supabase SQL Editor: Dashboard -> SQL Editor -> New Query
-- ==============================================================================

-- 1. Create Circles Table
create table if not exists public.circles (
  id text primary key,
  name text not null,
  code text not null unique,
  description text default '',
  keeper_id text not null,
  keeper_name text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Index on code for lightning fast lookups
create index if not exists idx_circles_code on public.circles(code);

-- 2. Create Circle Members Table
create table if not exists public.circle_members (
  id text primary key,
  circle_id text not null references public.circles(id) on delete cascade,
  name text not null,
  role text default 'member',
  patronus_form text default 'Silver Spark',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index if not exists idx_circle_members_circle on public.circle_members(circle_id);

-- 3. Create Messages Table
create table if not exists public.messages (
  id text primary key,
  circle_id text not null references public.circles(id) on delete cascade,
  sender_id text not null,
  sender_name text not null,
  content text not null,
  message_type text default 'standard',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index if not exists idx_messages_circle on public.messages(circle_id, created_at);

-- 4. Enable Row Level Security (RLS)
alter table public.circles enable row level security;
alter table public.circle_members enable row level security;
alter table public.messages enable row level security;

-- Policies allowing public read/write access for anonymous circle communication
create policy "Allow public read access on circles" on public.circles
  for select using (true);

create policy "Allow public insert on circles" on public.circles
  for insert with check (true);

create policy "Allow public read access on circle_members" on public.circle_members
  for select using (true);

create policy "Allow public insert on circle_members" on public.circle_members
  for insert with check (true);

create policy "Allow public read access on messages" on public.messages
  for select using (true);

create policy "Allow public insert on messages" on public.messages
  for insert with check (true);

-- 5. Enable Real-time Broadcast & Replication
alter publication supabase_realtime add table public.messages;
alter publication supabase_realtime add table public.circle_members;

-- 6. Pre-seed Demo Marauders Circle
insert into public.circles (id, name, code, description, keeper_id, keeper_name)
values (
  'circle-marauders',
  'The Marauders',
  'PATR-7X2K',
  'Solemnly swearing we are up to good magic.',
  'wizard-harry',
  'Harry'
)
on conflict (code) do nothing;

insert into public.circle_members (id, circle_id, name, role, patronus_form)
values
  ('wizard-harry', 'circle-marauders', 'Harry', 'keeper', 'Stag'),
  ('wizard-hermione', 'circle-marauders', 'Hermione', 'member', 'Otter'),
  ('wizard-ron', 'circle-marauders', 'Ron', 'member', 'Terrier')
on conflict (id) do nothing;

insert into public.messages (id, circle_id, sender_id, sender_name, content, message_type)
values
  ('msg-init-1', 'circle-marauders', 'wizard-hermione', 'Hermione', 'Are we still meeting at the clocktower at 7?', 'standard'),
  ('msg-init-2', 'circle-marauders', 'wizard-harry', 'Harry', 'Of course! I have the parchment and notes ready.', 'standard'),
  ('msg-init-3', 'circle-marauders', 'wizard-ron', 'Ron', 'Brilliant. I will bring some cauldron cakes from the Great Hall 🍰', 'standard')
on conflict (id) do nothing;
