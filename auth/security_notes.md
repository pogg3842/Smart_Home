# Ghi chú bảo mật

Không đưa `SUPABASE_SERVICE_ROLE_KEY` vào frontend hoặc ESP32.

Không bật chế độ bỏ qua đăng nhập.

Mỗi ESP32 nên có `device_secret` riêng. Nếu bị lộ, đổi secret trong Supabase và nạp lại ESP32.

Khi deploy thật, dùng HTTPS/WSS. Local có thể dùng HTTP/WS để test trong mạng nội bộ.
