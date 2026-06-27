-- SMART_HOME V7 - chuyển sang chế độ THÊM THIẾT BỊ THỦ CÔNG
-- Chạy file này khi bỏ cơ chế DETECT để xóa các thiết bị tự sinh/trùng từ bản cũ.
-- File này KHÔNG xóa tài khoản, KHÔNG xóa nhà, KHÔNG xóa Gateway, KHÔNG đụng .env.

delete from public.device_logs;
delete from public.smart_devices;

update public.esp32_devices
set status = 'offline', last_seen_at = null, updated_at = now();
