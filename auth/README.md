# Auth SMHOME

Folder này chỉ mô tả phần đăng nhập và phân quyền.

Nguyên tắc bản thật:

- Frontend chỉ dùng `VITE_SUPABASE_ANON_KEY` để đăng nhập Supabase Auth.
- Backend dùng `SUPABASE_SERVICE_ROLE_KEY` để kiểm tra user, home, ESP32 và thiết bị.
- ESP32 không kết nối Supabase trực tiếp.
- User chỉ vào được nhà/thiết bị nếu có dòng tương ứng trong `home_members`.
- ESP32 chỉ được server nhận nếu `deviceId`, `homeId`, `device_secret` khớp bảng `esp32_devices`.

Luồng đăng nhập:

1. Người dùng đăng nhập bằng Supabase Auth.
2. Frontend lấy access token.
3. Frontend gọi `GET /api/me/homes` kèm `Authorization: Bearer <token>`.
4. Backend kiểm tra token bằng Supabase.
5. Backend trả về các nhà mà user có trong `home_members`.
6. Nếu không có nhà nào, giao diện không vào dashboard.

Luồng thiết bị:

1. ESP32 kết nối WebSocket `/device`.
2. ESP32 gửi `DEVICE_HELLO` có `deviceId`, `homeId`, `nonce`, `signature`.
3. Backend lấy `device_secret` từ `esp32_devices`.
4. Backend kiểm tra HMAC.
5. Nếu đúng, backend nhận ESP32 và đồng bộ GPIO vào `smart_devices`.
