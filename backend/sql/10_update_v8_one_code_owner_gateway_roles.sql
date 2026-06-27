-- SMART HOME V8 - 1 mã nhà cho người dùng, nhiều ESP32 nội bộ
-- Chạy file này nếu database của bạn đã có schema từ V7/Stage5.

alter table public.homes
  add column if not exists home_code text,
  add column if not exists owner_id uuid references auth.users(id) on delete set null,
  add column if not exists service_status text not null default 'active';

create unique index if not exists idx_homes_home_code_unique
  on public.homes(home_code)
  where home_code is not null;

alter table public.esp32_devices
  add column if not exists gateway_role text not null default 'control'
    check (gateway_role in ('control', 'voice', 'sensor')),
  add column if not exists location_note text,
  add column if not exists pair_code text,
  add column if not exists paired_at timestamptz;

create unique index if not exists idx_esp32_devices_pair_code_unique
  on public.esp32_devices(pair_code)
  where pair_code is not null;

-- Mỗi nhà chỉ có 1 chủ nhà.
create unique index if not exists idx_home_members_one_owner_per_home
  on public.home_members(home_id)
  where role = 'owner';

create index if not exists idx_home_members_user on public.home_members(user_id);
create index if not exists idx_esp32_devices_home_role on public.esp32_devices(home_id, gateway_role);
create index if not exists idx_smart_devices_home_gpio on public.smart_devices(home_id, esp32_id, gpio_pin);

-- Manual device mode: thiết bị được thêm thủ công nên luôn dùng is_connected=true khi đã thêm.
alter table public.smart_devices
  add column if not exists is_connected boolean not null default true,
  add column if not exists is_locked boolean not null default false,
  add column if not exists member_can_control boolean not null default true;
