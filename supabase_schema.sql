-- 집수리왕 서버 저장 전환용 Supabase 기본 스키마
-- Supabase SQL Editor에서 실행한 뒤, 앱에는 Project URL과 anon public key만 연결합니다.

create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  role text not null check (role in ('requester', 'worker', 'admin')),
  name text not null,
  birth_date date,
  login_hash text not null unique,
  password_hash text not null,
  display_login_id text not null,
  worker_categories text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.workers (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references public.profiles(id) on delete set null,
  name text not null,
  phone text not null default '999-9999-9999',
  primary_category text not null,
  categories text[] not null default '{}',
  specialty text not null default '',
  coverage text not null default '',
  intro text not null default '',
  completed_jobs integer not null default 0,
  performance text not null default '',
  images jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.repair_requests (
  id uuid primary key default gen_random_uuid(),
  requester_profile_id uuid references public.profiles(id) on delete set null,
  requester_name text not null,
  category text not null,
  title text not null,
  location text not null,
  description text not null,
  budget integer not null default 0,
  due_date date,
  status text not null default '요청' check (status in ('요청', '낙찰', '공사중', '공사완료', '입금완료')),
  customer_confirmed boolean not null default false,
  awarded_bid_id uuid,
  images jsonb not null default '[]'::jsonb,
  completion_images jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.bids (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.repair_requests(id) on delete cascade,
  worker_profile_id uuid references public.profiles(id) on delete set null,
  worker_name text not null,
  worker_phone text not null default '999-9999-9999',
  amount integer not null default 0,
  note text not null default '',
  created_at timestamptz not null default now()
);

alter table public.repair_requests
  drop constraint if exists repair_requests_awarded_bid_id_fkey;

alter table public.repair_requests
  add constraint repair_requests_awarded_bid_id_fkey
  foreign key (awarded_bid_id) references public.bids(id) on delete set null;

create table if not exists public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.repair_requests(id) on delete cascade,
  author_profile_id uuid references public.profiles(id) on delete set null,
  author_role text not null check (author_role in ('requester', 'worker', 'admin')),
  author_name text not null,
  message text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_profiles_role on public.profiles(role);
create index if not exists idx_workers_categories on public.workers using gin(categories);
create index if not exists idx_requests_requester on public.repair_requests(requester_name);
create index if not exists idx_requests_status on public.repair_requests(status);
create index if not exists idx_bids_request on public.bids(request_id);
create index if not exists idx_chat_request on public.chat_messages(request_id);

create table if not exists public.app_state (
  id text primary key,
  payload jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.workers enable row level security;
alter table public.repair_requests enable row level security;
alter table public.bids enable row level security;
alter table public.chat_messages enable row level security;
alter table public.app_state enable row level security;

-- 임시 필드테스트 단계 정책: anon key로 CRUD 허용.
-- 실제 운영 전에는 반드시 로그인 세션 기반 정책으로 좁혀야 합니다.
drop policy if exists "field test profiles all" on public.profiles;
drop policy if exists "field test workers all" on public.workers;
drop policy if exists "field test requests all" on public.repair_requests;
drop policy if exists "field test bids all" on public.bids;
drop policy if exists "field test chat all" on public.chat_messages;
drop policy if exists "field test app state all" on public.app_state;

create policy "field test profiles all" on public.profiles for all using (true) with check (true);
create policy "field test workers all" on public.workers for all using (true) with check (true);
create policy "field test requests all" on public.repair_requests for all using (true) with check (true);
create policy "field test bids all" on public.bids for all using (true) with check (true);
create policy "field test chat all" on public.chat_messages for all using (true) with check (true);
create policy "field test app state all" on public.app_state for all using (true) with check (true);

insert into public.app_state (id, payload)
values ('live', '{"version":1,"requests":[],"workers":[],"accounts":[]}'::jsonb)
on conflict (id) do nothing;
