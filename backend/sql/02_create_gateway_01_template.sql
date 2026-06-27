-- Tạo Gateway 1 trước khi ghép trên web.
-- Ba giá trị này phải khớp với file ESP32: include/CauHinh.h
-- ESP32_ID      = SMH-GW-HAO-001
-- DEVICE_SECRET = hao-secret-001
-- Pair code nhập trên web: SMH-PAIR-001

insert into public.esp32_devices (
  id,
  home_id,
  name,
  device_secret,
  status,
  pair_code
)
values (
  'SMH-GW-HAO-001',
  null,
  'Gateway nha 1',
  'hao-secret-001',
  'offline',
  'SMH-PAIR-001'
)
on conflict (id) do update set
  name = excluded.name,
  device_secret = excluded.device_secret,
  pair_code = excluded.pair_code,
  status = 'offline',
  home_id = null,
  paired_at = null,
  last_seen_at = null,
  updated_at = now();
