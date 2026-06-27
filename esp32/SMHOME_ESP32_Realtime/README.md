# SMART HOME V1 - ESP32 đơn giản cho 1 Gateway

Bản này chỉ dùng cho 1 ESP32 trước. Khi muốn dùng ESP32 thứ 2, copy thư mục này hoặc sửa lại 3 dòng trong `include/CauHinh.h`:

```cpp
#define ESP32_ID "SMH-GW-HAO-001"
#define DEVICE_SECRET "hao-secret-001"
#define GATEWAY_NAME "Gateway tang 1"
```

## Mapping chân

| Thiết bị | CONTROL | DETECT |
|---|---:|---:|
| Thiết bị 1 | GPIO14 | GPIO27 |
| Thiết bị 2 | GPIO26 | GPIO25 |
| Thiết bị 3 | GPIO33 | GPIO32 |
| Thiết bị 4 | GPIO18 | GPIO19 |
| Thiết bị 5 | GPIO22 | GPIO23 |
| Thiết bị 6 | GPIO21 | GPIO13 |

DETECT nối GND thì thiết bị hiện trên web. CONTROL nối LED/relay để bật tắt.

Ví dụ Thiết bị 1:

```text
GPIO27 -> GND để hiện Thiết bị 1
GPIO14 -> điện trở 330Ω -> chân dài LED
chân ngắn LED -> GND
```

## Nạp code

```bash
cd SMART_HOME_V1_STAGE5_SIMPLE_ONE_ESP32
pio run -t upload
pio device monitor -b 115200
```

## SQL

1. `sql/01_reset_app_data_keep_tables.sql`: xóa dữ liệu app, giữ cấu trúc bảng.
2. `sql/02_create_gateway_01_template.sql`: tạo Gateway 1 để ghép trên web.

Mã ghép mặc định:

```text
SMH-PAIR-001
```
