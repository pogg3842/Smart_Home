# Backend SMHOME

Backend là trung tâm thực tế của hệ thống:

- Serve frontend build tại cùng cổng.
- API bảo vệ bằng Supabase access token.
- WebSocket `/device` cho ESP32.
- ESP32 xác thực bằng HMAC + `device_secret` trong Supabase.
- Backend dùng `SUPABASE_SERVICE_ROLE_KEY`; không đưa key này ra frontend/ESP32.

Chạy từ root project:

```bash
npm run build
npm start
```

Hoặc chỉ backend:

```bash
cd backend
npm install
npm start
```
