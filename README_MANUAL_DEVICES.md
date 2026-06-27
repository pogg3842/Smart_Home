# SMART_HOME_V7_MANUAL_DEVICES

Bản này đã bỏ chân DETECT. Thiết bị không còn tự hiện/ẩn theo dây cắm nữa.

## Logic mới

- ESP32 chỉ khai báo 6 chân CONTROL: GPIO14, GPIO26, GPIO33, GPIO18, GPIO22, GPIO21.
- Chủ nhà tự thêm thiết bị trong phần Cài đặt.
- Khi thêm thiết bị, website bắt chọn Gateway và GPIO để tránh nhầm chân.
- Card thiết bị hiển thị GPIO đang dùng.
- Có thể sửa tên thiết bị trong Cài đặt.
- Backend không tự tạo/xóa thiết bị theo ESP32 nữa.

## Mapping chân ESP32

| Thiết bị mẫu | GPIO CONTROL |
|---|---:|
| Cổng 1 | GPIO14 |
| Cổng 2 | GPIO26 |
| Cổng 3 | GPIO33 |
| Cổng 4 | GPIO18 |
| Cổng 5 | GPIO22 |
| Cổng 6 | GPIO21 |

Không dùng các chân DETECT cũ: GPIO27, GPIO25, GPIO32, GPIO19, GPIO23, GPIO13.

## Cách test LED

Ví dụ chọn GPIO14 trên web:

```text
GPIO14 -> điện trở 330Ω -> chân dài LED
chân ngắn LED -> GND
```

Không nối trực tiếp GPIO14 xuống GND.

## SQL nên chạy khi chuyển từ bản DETECT sang bản thủ công

Chạy trong Supabase SQL Editor:

```text
backend/sql/05_manual_devices_cleanup.sql
```

File này xóa thiết bị/log test cũ để bạn thêm lại thủ công cho sạch.
