-- SMART HOME V8 - Tạo nhà thứ 2 để test 1 chủ có 2 nhà.
-- Người dùng web nhập mã: SMH-HOME-000002

insert into public.homes (home_code, name, owner_id, service_status)
values ('SMH-HOME-000002', 'Nhà thông minh 000002', null, 'active')
on conflict (home_code) do update set
  name = excluded.name,
  service_status = 'active',
  updated_at = now();

insert into public.rooms (home_id, area_name, name)
select h.id, x.area_name, x.name
from public.homes h
cross join (values
  ('Tầng 1', 'Phòng khách'),
  ('Tầng 1', 'Phòng ngủ')
) as x(area_name, name)
where h.home_code = 'SMH-HOME-000002'
and not exists (
  select 1 from public.rooms r
  where r.home_id = h.id and r.area_name = x.area_name and r.name = x.name
);

insert into public.esp32_devices (id, home_id, name, device_secret, gateway_role, location_note, status, pair_code, paired_at)
select 'SMH-GW-000002-CTRL-01', h.id, 'Bộ điều khiển relay nhà 000002', 'secret-000002-ctrl-01', 'control', 'Tủ điện tầng 1', 'offline', null, now()
from public.homes h where h.home_code = 'SMH-HOME-000002'
on conflict (id) do update set
  home_id = excluded.home_id,
  name = excluded.name,
  device_secret = excluded.device_secret,
  gateway_role = excluded.gateway_role,
  location_note = excluded.location_note,
  pair_code = null,
  updated_at = now();

insert into public.esp32_devices (id, home_id, name, device_secret, gateway_role, location_note, status, pair_code, paired_at)
select 'SMH-GW-000002-VOICE-01', h.id, 'Loa/mic thông minh nhà 000002', 'secret-000002-voice-01', 'voice', 'Phòng khách', 'offline', null, now()
from public.homes h where h.home_code = 'SMH-HOME-000002'
on conflict (id) do update set
  home_id = excluded.home_id,
  name = excluded.name,
  device_secret = excluded.device_secret,
  gateway_role = excluded.gateway_role,
  location_note = excluded.location_note,
  pair_code = null,
  updated_at = now();
