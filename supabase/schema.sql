-- Club5to7 · Supabase schema
-- Run this entire file in: Supabase Dashboard → SQL Editor → New query → Run

-- ── Key-value store (singletons: site_settings, current_pick, etc.) ──────────
create table if not exists kv_store (
  key        text primary key,
  value      jsonb not null default '{}'::jsonb,
  updated_at timestamptz default now()
);

-- ── Hot takes ────────────────────────────────────────────────────────────────
create table if not exists hot_takes (
  id         text primary key default gen_random_uuid()::text,
  author     text not null,
  title      text not null,
  body       text not null,
  pinned     boolean default false,
  approved   boolean default false,
  votes      integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ── Theme requests ───────────────────────────────────────────────────────────
create table if not exists theme_requests (
  id         text primary key default gen_random_uuid()::text,
  theme      text not null,
  why        text,
  by         text not null,
  status     text default 'pending',
  votes      integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ── Digest issues ────────────────────────────────────────────────────────────
create table if not exists digest_issues (
  id           text primary key default gen_random_uuid()::text,
  number       integer not null,
  title        text not null,
  dek          text,
  author       text,
  published_at bigint default 0,
  status       text default 'draft',
  body_html    text,
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);

-- ── Film pool ────────────────────────────────────────────────────────────────
create table if not exists film_pool (
  id          text primary key default gen_random_uuid()::text,
  title       text not null,
  in_rotation boolean default true,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- ── Events ───────────────────────────────────────────────────────────────────
create table if not exists events (
  id              text primary key default gen_random_uuid()::text,
  title           text not null,
  date_iso        text,
  date_label      text,
  venue           text,
  capacity        integer default 18,
  description     text,
  cover_caption   text,
  require_payment boolean default false,
  price_birr      integer default 0,
  rsvps_seed      jsonb default '[]'::jsonb,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

-- ── RSVPs ────────────────────────────────────────────────────────────────────
create table if not exists rsvps (
  id         text primary key default gen_random_uuid()::text,
  event_id   text not null references events(id) on delete cascade,
  handle     text not null,
  status     text default 'going',
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (event_id, handle)
);

-- ── Challenges ───────────────────────────────────────────────────────────────
create table if not exists challenges (
  id          text primary key default gen_random_uuid()::text,
  title       text not null,
  description text,
  target      integer default 5,
  base_points integer default 160,
  per_film    integer default 10,
  bonus       integer default 30,
  bonus_film  text,
  active      boolean default true,
  ends_label  text,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- ── Challenge log ────────────────────────────────────────────────────────────
create table if not exists challenge_log (
  id            text primary key default gen_random_uuid()::text,
  challenge_id  text not null references challenges(id) on delete cascade,
  member        text not null,
  films_watched integer default 0,
  bonus_hit     boolean default false,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

-- ── Ping pong scores ─────────────────────────────────────────────────────────
create table if not exists pong_scores (
  id             text primary key default gen_random_uuid()::text,
  handle         text not null,
  score          integer default 0,
  opponent_score integer default 0,
  created_at     timestamptz default now(),
  updated_at     timestamptz default now()
);

-- ── Members ──────────────────────────────────────────────────────────────────
create table if not exists members (
  id         text primary key default gen_random_uuid()::text,
  handle     text unique not null,
  name       text,
  joined     text,
  status     text default 'active',
  role       text default 'member',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ── Row Level Security ───────────────────────────────────────────────────────
-- Open anon read/write while using demo auth. Tighten once real auth is in.

alter table kv_store       enable row level security;
alter table hot_takes      enable row level security;
alter table theme_requests enable row level security;
alter table digest_issues  enable row level security;
alter table film_pool      enable row level security;
alter table events         enable row level security;
alter table rsvps          enable row level security;
alter table challenges     enable row level security;
alter table challenge_log  enable row level security;
alter table pong_scores    enable row level security;
alter table members        enable row level security;

create policy "anon read"  on kv_store       for select to anon using (true);
create policy "anon write" on kv_store       for all    to anon using (true) with check (true);
create policy "anon read"  on hot_takes      for select to anon using (true);
create policy "anon write" on hot_takes      for all    to anon using (true) with check (true);
create policy "anon read"  on theme_requests for select to anon using (true);
create policy "anon write" on theme_requests for all    to anon using (true) with check (true);
create policy "anon read"  on digest_issues  for select to anon using (true);
create policy "anon write" on digest_issues  for all    to anon using (true) with check (true);
create policy "anon read"  on film_pool      for select to anon using (true);
create policy "anon write" on film_pool      for all    to anon using (true) with check (true);
create policy "anon read"  on events         for select to anon using (true);
create policy "anon write" on events         for all    to anon using (true) with check (true);
create policy "anon read"  on rsvps          for select to anon using (true);
create policy "anon write" on rsvps          for all    to anon using (true) with check (true);
create policy "anon read"  on challenges     for select to anon using (true);
create policy "anon write" on challenges     for all    to anon using (true) with check (true);
create policy "anon read"  on challenge_log  for select to anon using (true);
create policy "anon write" on challenge_log  for all    to anon using (true) with check (true);
create policy "anon read"  on pong_scores    for select to anon using (true);
create policy "anon write" on pong_scores    for all    to anon using (true) with check (true);
create policy "anon read"  on members        for select to anon using (true);
create policy "anon write" on members        for all    to anon using (true) with check (true);

-- ── Realtime ─────────────────────────────────────────────────────────────────
-- Enable realtime for live RSVP counter and hot-takes updates.
-- (Also enable in Dashboard → Database → Replication if not set automatically)
alter publication supabase_realtime add table rsvps;
alter publication supabase_realtime add table hot_takes;
alter publication supabase_realtime add table theme_requests;
