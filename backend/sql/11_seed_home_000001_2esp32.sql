-- SMART HOME V8 - Tạo sẵn 1 nhà + 2 ESP32 nội bộ để test.
-- Người dùng web nhập mã: SMH-HOME-000001
-- ESP32 điều khiển dùng:
--   ESP32_ID      = SMH-GW-000001-CTRL-01
--   DEVICE_SECRET = secret-000001-ctrl-01
-- ESP32 loa/mic dùng sau:
--   ESP32_ID      = SMH-GW-000001-VOICE-01
--   DEVICE_SECRET = secret-000001-voice-01

insert into public.homes (home_code, name, owner_id, service_status)
values ('SMH-HOME-000001', 'Nhà thông minh 000001', null, 'active')
on conflict (home_code) do update set
  name = excluded.name,
  service_status = 'active',
  updated_at = now();

insert into public.rooms (home_id, area_name, name)
select h.id, x.area_name, x.name
from public.homes h
cross join (values
  ('Tầng 1', 'Phòng khách'),
  ('Tầng 1', 'Phòng ngủ'),
  ('Tầng 1', 'Bếp'),
  ('Ngoài trời', 'Sân')
) as x(area_name, name)
where h.home_code = 'SMH-HOME-000001'
and not exists (
  select 1 from public.rooms r
  where r.home_id = h.id and r.area_name = x.area_name and r.name = x.name
);

insert into public.esp32_devices (id, home_id, name, device_secret, gateway_role, location_note, status, pair_code, paired_at)
select 'SMH-GW-000001-CTRL-01', h.id, 'Bộ điều khiển relay nhà 000001', 'secret-000001-ctrl-01', 'control', 'Tủ điện tầng 1', 'offline', null, now()
from public.homes h where h.home_code = 'SMH-HOME-000001'
on conflict (id) do update set
  home_id = excluded.home_id,
  name = excluded.name,
  device_secret = excluded.device_secret,
  gateway_role = excluded.gateway_role,
  location_note = excluded.location_note,
  pair_code = null,
  updated_at = now();

insert into public.esp32_devices (id, home_id, name, device_secret, gateway_role, location_note, status, pair_code, paired_at)
select 'SMH-GW-000001-VOICE-01', h.id, 'Loa/mic thông minh nhà 000001', 'secret-000001-voice-01', 'voice', 'Phòng khách', 'offline', null, now()
from public.homes h where h.home_code = 'SMH-HOME-000001'
on conflict (id) do update set
  home_id = excluded.home_id,
  name = excluded.name,
  device_secret = excluded.device_secret,
  gateway_role = excluded.gateway_role,
  location_note = excluded.location_note,
  pair_code = null,
  updated_at = now();
