-- SMART_HOME V1 - Stage 5 Website Best
-- Mục tiêu:
-- 1) Một tài khoản có thể có nhiều nhà/công trình
-- 2) Phân quyền owner/member
-- 3) Chủ nhà khóa quyền điều khiển của member theo từng thiết bị
-- 4) Chuẩn bị trạng thái dịch vụ để sau này web nội bộ có thể khóa hợp đồng

create extension if not exists pgcrypto;

alter table public.homes
  add column if not exists home_code text,
  add column if not exists service_status text not null default 'active';

alter table public.homes
  drop constraint if exists homes_service_status_check;

alter table public.homes
  add constraint homes_service_status_check
  check (service_status in ('active', 'suspended', 'maintenance', 'terminated'));

update public.homes
set home_code = 'HOME-' || upper(substr(id::text, 1, 8))
where home_code is null;

create unique index if not exists idx_homes_home_code
on public.homes(home_code)
where home_code is not null;

alter table public.smart_devices
  add column if not exists is_connected boolean not null default false,
  add column if not exists is_locked boolean not null default false,
  add column if not exists member_can_control boolean not null default true;

create index if not exists idx_smart_devices_connected
on public.smart_devices(home_id, esp32_id, is_connected);

create index if not exists idx_esp32_devices_home_status
on public.esp32_devices(home_id, status);
