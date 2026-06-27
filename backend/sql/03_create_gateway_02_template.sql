-- Mẫu cho ESP32 thứ 2 / nhà thứ 2.
-- Khi cần dùng, sửa code ESP32 thành:
-- #define ESP32_ID "SMH-GW-HAO-002"
-- #define DEVICE_SECRET "hao-secret-002"
-- #define GATEWAY_NAME "Gateway nha 2"
-- Rồi chạy SQL này và nhập SMH-PAIR-002 trên web.

insert into public.esp32_devices (
  id,
  home_id,
  name,
  device_secret,
  status,
  pair_code
)
values (
  'SMH-GW-HAO-002',
  null,
  'Gateway nha 2',
  'hao-secret-002',
  'offline',
  'SMH-PAIR-002'
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
