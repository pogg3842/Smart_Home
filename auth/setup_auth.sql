-- 1) Chạy file backend/sql/supabase_schema.sql trước.
-- 2) Tạo user trong Supabase Dashboard > Authentication > Users.
-- 3) Copy user_id của tài khoản vừa tạo.

-- Xem danh sách user để lấy id:
select id, email, created_at from auth.users order by created_at desc;

-- Tạo một nhà và gán chủ nhà.
-- Thay <USER_UUID> bằng id từ auth.users.
insert into public.homes (name, owner_id)
values ('Nhà chính', '<USER_UUID>')
returning id;

-- Thay <HOME_UUID> bằng id vừa trả về.
insert into public.home_members (home_id, user_id, role)
values ('<HOME_UUID>', '<USER_UUID>', 'owner');

-- Đăng ký ESP32 thật.
-- DEVICE_SECRET_RIENG phải dán giống hệt vào esp32/SMHOME_ESP32_Realtime/CauHinh.h.
insert into public.esp32_devices (id, home_id, name, device_secret)
values ('esp32-01', '<HOME_UUID>', 'ESP32 phòng khách', '<DEVICE_SECRET_RIENG>');
