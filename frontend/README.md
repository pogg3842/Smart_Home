# Smart Home Ion UI - Mobile Basic / Advanced

Giao diện React/Vite cho web điều khiển nhà thông minh.

## Chức năng UI hiện tại

### Mobile
Có 2 chế độ:

- **Cơ bản**
  - Trạng thái kết nối ESP32
  - Trạng thái kết nối Supabase
  - Điều khiển thiết bị
  - Nhập lệnh bằng text
  - Microphone dùng mic của chính thiết bị: điện thoại/laptop

- **Nâng cao**
  - Kết nối chi tiết ESP32/Supabase/WiFi/Auth
  - Log hệ thống
  - Thông tin hệ thống

### PC
- Mặc định hiện full chức năng.
- Không cần bấm qua lại Cơ bản/Nâng cao.

## Chạy project

```bash
npm install
npm run dev
```

## Cấu trúc

```txt
src/
├── components/
│   ├── TieuDeUngDung.jsx
│   ├── ChuyenCheDoMobile.jsx
│   ├── BangKetNoiNhanh.jsx
│   ├── BangDieuKhienThietBi.jsx
│   ├── OThietBi.jsx
│   ├── ONhapLenh.jsx
│   ├── OMicroThietBi.jsx
│   ├── BangNangCao.jsx
│   ├── ChiTietKetNoi.jsx
│   ├── LogHeThong.jsx
│   └── ThongTinHeThong.jsx
│
├── js/
│   ├── cheDoUi.js
│   ├── duLieuThietBi.js
│   ├── duLieuHeThong.js
│   └── xuLyThietBi.js
│
├── App.jsx
├── main.jsx
└── style.css
```

## Ghi chú

- Tập trung UI/UX trước.
- Chưa gắn backend, WebSocket, Supabase thật.
- Không viết CSS trong component.
- Không dùng mic ESP32 cho giao diện web.
- Microphone trong UI là mic của chính thiết bị đang mở web.
