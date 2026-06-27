# SMART HOME V1 - Stage 5 Website Best

Bản này là bản website/backend ổn nhất hiện tại để học từng bước trước khi mở rộng thành sản phẩm thật.

## Có gì mới

- Một tài khoản có thể tạo nhiều nhà/công trình.
- Mỗi nhà có mã `home_code` riêng.
- Một nhà có thể ghép nhiều ESP32 Gateway.
- Chủ nhà `owner` được ghép Gateway, sửa tên thiết bị, xóa thiết bị, khóa quyền điều khiển của thành viên.
- Thành viên `member` chỉ bật/tắt thiết bị nếu chủ nhà cho phép.
- Có cột `service_status` để sau này làm web nội bộ khóa dịch vụ khi hết hợp đồng.
- Device Control chỉ hiện thiết bị khi ESP32 báo chân DETECT đang cắm xuống GND.
- ESP32 code đơn giản: 1 file cấu hình chính `esp32/SMHOME_ESP32_Realtime/include/CauHinh.h`.

## Thứ tự chạy SQL khi học lại từ đầu

Vào Supabase → SQL Editor → chạy theo thứ tự.

Nếu Supabase mới hoàn toàn, chạy trước:

```sql
backend/sql/00_full_schema_stage5.sql
```

Nếu database đã có bảng từ bản cũ, chạy:

```sql
backend/sql/update_v5_multi_home_roles.sql
```

Sau đó, nếu muốn xóa dữ liệu cũ nhưng giữ bảng:

```sql
backend/sql/01_reset_app_data_keep_tables.sql
```

Tiếp theo, tạo Gateway 1:

```sql
backend/sql/02_create_gateway_01_template.sql
```

Gateway 1 dùng:

```text
ESP32_ID      = SMH-GW-HAO-001
DEVICE_SECRET = hao-secret-001
Pair code     = SMH-PAIR-001
```

## Chạy website

Ở thư mục gốc project:

```bash
npm install
npm run dev
```

Web frontend thường mở ở:

```text
http://localhost:5173
```

Backend/API/WebSocket chạy ở:

```text
http://localhost:3000
ws://<IP_MAY_CHU>:3000/device
```

## Luồng học đúng

1. Chạy SQL update v5.
2. Chạy SQL reset dữ liệu.
3. Chạy SQL tạo Gateway 1.
4. Chạy web bằng `npm run dev`.
5. Đăng ký / đăng nhập tài khoản.
6. Tạo nhà mới, ví dụ `Nha 1`.
7. Nhập mã ghép Gateway: `SMH-PAIR-001`.
8. Nạp ESP32 với `ESP32_ID` và `DEVICE_SECRET` khớp Gateway 1.
9. Cắm dây DETECT xuống GND để thiết bị hiện trên web.
10. Bấm bật/tắt trên web để test LED/relay.

## Sửa mã ESP32 số 1

Mở file:

```text
esp32/SMHOME_ESP32_Realtime/include/CauHinh.h
```

Đoạn quan trọng:

```cpp
#define ESP32_ID "SMH-GW-HAO-001"
#define DEVICE_SECRET "hao-secret-001"
#define GATEWAY_NAME "Gateway nha 1"
```

Hai giá trị này phải khớp với Supabase:

```text
ESP32_ID      = esp32_devices.id
DEVICE_SECRET = esp32_devices.device_secret
```

## Muốn nạp cho ESP32 thứ 2 / nhà thứ 2

Sửa trong `CauHinh.h`:

```cpp
#define ESP32_ID "SMH-GW-HAO-002"
#define DEVICE_SECRET "hao-secret-002"
#define GATEWAY_NAME "Gateway nha 2"
```

Sau đó chạy SQL:

```sql
backend/sql/03_create_gateway_02_template.sql
```

Rồi trên web, tạo/chọn `Nha 2` và ghép bằng mã:

```text
SMH-PAIR-002
```

## Mapping chân ESP32

| Thiết bị | CONTROL bật/tắt LED/relay | DETECT để hiện trên web |
|---|---:|---:|
| Thiết bị 1 | GPIO14 | GPIO27 |
| Thiết bị 2 | GPIO26 | GPIO25 |
| Thiết bị 3 | GPIO33 | GPIO32 |
| Thiết bị 4 | GPIO18 | GPIO19 |
| Thiết bị 5 | GPIO22 | GPIO23 |
| Thiết bị 6 | GPIO21 | GPIO13 |

Ví dụ Thiết bị 1:

```text
GPIO27 → GND
=> hiện Thiết bị 1 trên web

GPIO14 → điện trở 330Ω → chân dài LED
chân ngắn LED → GND
=> bấm web thì LED sáng/tắt
```

## Lưu ý bảo mật

File `.env` thật không được đưa lên GitHub công khai. Bản zip này chỉ có `.env.example`. Nếu bạn đã có `.env` cũ thì copy vào thư mục gốc project mới.
