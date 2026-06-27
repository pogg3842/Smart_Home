-- SMART_HOME V1 - FULL SCHEMA STAGE 5
-- Dùng khi Supabase mới hoàn toàn hoặc bạn đã drop schema public.
-- Nếu database của bạn đã có bảng, chỉ cần chạy update_v5_multi_home_roles.sql.

create extension if not exists pgcrypto;

create table if not exists public.homes (
  id uuid primary key default gen_random_uuid(),
  home_code text unique,
  name text not null,
  owner_id uuid references auth.users(id) on delete set null,
  service_status text not null default 'active'
    check (service_status in ('active', 'suspended', 'maintenance', 'terminated')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.home_members (
  home_id uuid references public.homes(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  role text not null check (role in ('owner', 'member', 'guest')) default 'member',
  created_at timestamptz not null default now(),
  primary key (home_id, user_id)
);

create table if not exists public.esp32_devices (
  id text primary key,
  home_id uuid references public.homes(id) on delete cascade,
  name text not null,
  device_secret text not null,
  pair_code text,
  paired_at timestamptz,
  status text not null check (status in ('online', 'offline')) default 'offline',
  last_seen_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.rooms (
  id uuid primary key default gen_random_uuid(),
  home_id uuid not null references public.homes(id) on delete cascade,
  area_name text not null default 'Tầng 1',
  name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.smart_devices (
  id uuid primary key default gen_random_uuid(),
  home_id uuid not null references public.homes(id) on delete cascade,
  esp32_id text not null references public.esp32_devices(id) on delete cascade,
  room_id uuid references public.rooms(id) on delete set null,
  gpio_pin integer not null,
  device_name text not null,
  device_type text not null default 'Thiết bị',
  icon text not null default 'den',
  area_name text not null default 'Tầng 1',
  room_name text not null default 'Chưa chọn phòng',
  is_on boolean not null default false,
  is_connected boolean not null default false,
  is_locked boolean not null default false,
  member_can_control boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (home_id, esp32_id, gpio_pin)
);

create table if not exists public.device_logs (
  id uuid primary key default gen_random_uuid(),
  home_id uuid references public.homes(id) on delete cascade,
  smart_device_id uuid references public.smart_devices(id) on delete set null,
  user_id uuid references auth.users(id) on delete set null,
  action text not null,
  success boolean not null default false,
  message text,
  created_at timestamptz not null default now()
);

create unique index if not exists idx_esp32_devices_pair_code
  on public.esp32_devices(pair_code)
  where pair_code is not null;

create index if not exists idx_home_members_user on public.home_members(user_id);
create index if not exists idx_smart_devices_home on public.smart_devices(home_id);
create index if not exists idx_smart_devices_connected on public.smart_devices(home_id, esp32_id, is_connected);
create index if not exists idx_esp32_devices_home_status on public.esp32_devices(home_id, status);
create index if not exists idx_logs_home_time on public.device_logs(home_id, created_at desc);

alter table public.homes enable row level security;
alter table public.home_members enable row level security;
alter table public.esp32_devices enable row level security;
alter table public.rooms enable row level security;
alter table public.smart_devices enable row level security;
alter table public.device_logs enable row level security;

drop policy if exists "members can read their homes" on public.homes;
create policy "members can read their homes" on public.homes
for select using (
  exists (
    select 1 from public.home_members hm
    where hm.home_id = homes.id and hm.user_id = auth.uid()
  )
);

drop policy if exists "members can read own membership" on public.home_members;
create policy "members can read own membership" on public.home_members
for select using (user_id = auth.uid());
