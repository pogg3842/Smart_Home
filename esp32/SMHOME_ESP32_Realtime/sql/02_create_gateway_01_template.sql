-- =====================================================
-- TẠO GATEWAY 1 ĐỂ GHÉP VÀO NHÀ
-- Chạy sau khi đã reset dữ liệu và tạo nhà trên web.
-- ESP32_ID và DEVICE_SECRET ở đây phải khớp với include/CauHinh.h.
-- pair_code là mã bạn nhập trên web để ghép Gateway.
-- =====================================================

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
  'Gateway tầng 1',
  'hao-secret-001',
  'offline',
  'SMH-PAIR-001'
)
on conflict (id) do update set
  home_id = null,
  name = excluded.name,
  device_secret = excluded.device_secret,
  status = 'offline',
  pair_code = excluded.pair_code,
  updated_at = now();
