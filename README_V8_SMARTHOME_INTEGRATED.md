# SMART_HOME V8 - SmartHome Integrated

Bản này đi theo hướng ổn định hơn cho mô hình nhà thông minh thực tế:

- Người dùng đăng nhập rồi nhập **1 mã thiết bị / mã nhà**.
- Ai nhập mã đầu tiên sẽ trở thành **chủ nhà**.
- Một nhà chỉ có **1 chủ nhà**.
- Một chủ nhà có thể kết nối **nhiều nhà** bằng nhiều mã khác nhau.
- Một nhà có thể có nhiều ESP32 nội bộ:
  - `control`: ESP32 điều khiển GPIO/relay.
  - `voice`: ESP32 tích hợp loa/mic giống hộp Alexa, dùng cho giai đoạn sau.
- Không dùng DETECT nữa.
- Thiết bị được thêm thủ công trên web: chọn Gateway + GPIO + tên + phòng/khu vực.
- Card thiết bị hiển thị rõ GPIO đang dùng.
- Có nút **Gỡ kết nối chủ nhà** để đổi chủ/bán nhà đơn giản hơn.

## 1. Luồng dùng chính

```text
Đăng nhập
→ nhập mã SMH-HOME-000001
→ nếu nhà chưa có chủ, tài khoản này thành chủ nhà
→ vào Cài đặt
→ thêm phòng/khu vực
→ thêm thiết bị thủ công
→ chọn Gateway điều khiển + GPIO
→ bật/tắt thiết bị trên web
```

## 2. SQL cần chạy

Nếu database đã có từ V7/Stage5, chạy:

```text
backend/sql/10_update_v8_one_code_owner_gateway_roles.sql
```

Sau đó tạo nhà test + 2 ESP32 nội bộ:

```text
backend/sql/11_seed_home_000001_2esp32.sql
```

Muốn test nhà thứ 2:

```text
backend/sql/12_seed_home_000002_2esp32.sql
```

Muốn gỡ toàn bộ chủ nhà để học lại luồng ai nhập trước làm chủ:

```text
backend/sql/13_reset_owner_connections_only.sql
```

Muốn xóa thiết bị test cũ nhưng giữ nhà/gateway/chủ nhà:

```text
backend/sql/14_cleanup_manual_devices.sql
```

Nếu Supabase hoàn toàn mới, chạy:

```text
backend/sql/00_full_schema_v8.sql
backend/sql/11_seed_home_000001_2esp32.sql
```

## 3. Mã để người dùng nhập

```text
SMH-HOME-000001
```

Người dùng không cần nhập mã ESP32.

## 4. ESP32 control mặc định

File cấu hình:

```text
esp32/SMHOME_ESP32_Realtime/include/CauHinh.h
```

Đang để:

```cpp
#define ESP32_ID "SMH-GW-000001-CTRL-01"
#define DEVICE_SECRET "secret-000001-ctrl-01"
#define GATEWAY_NAME "Bo dieu khien nha 000001"
```

Các dòng WiFi/IP máy trong `CauHinh.h` đã được giữ lại theo bản bạn đang dùng.

## 5. GPIO điều khiển

| Cổng | GPIO |
|---|---:|
| Cổng 1 | GPIO14 |
| Cổng 2 | GPIO26 |
| Cổng 3 | GPIO33 |
| Cổng 4 | GPIO18 |
| Cổng 5 | GPIO22 |
| Cổng 6 | GPIO21 |

Cắm LED test:

```text
GPIO14 → điện trở 330Ω → chân dài LED
chân ngắn LED → GND
```

Không cắm trực tiếp `GPIO14 → GND`.

## 6. Nạp ESP32

```bash
cd esp32/SMHOME_ESP32_Realtime
pio run -t upload --upload-port /dev/ttyUSB0
pio device monitor -b 115200 --port /dev/ttyUSB0
```

Nếu không đúng cổng:

```bash
pio device list
```

## 7. Chạy web/backend

```bash
npm install
npm run dev
```

Mở web, đăng nhập rồi nhập mã:

```text
SMH-HOME-000001
```

## 8. Khi muốn chuyển ESP32 sang nhà thứ 2

Trong `CauHinh.h`, sửa thành:

```cpp
#define ESP32_ID "SMH-GW-000002-CTRL-01"
#define DEVICE_SECRET "secret-000002-ctrl-01"
#define GATEWAY_NAME "Bo dieu khien nha 000002"
```

Rồi chạy SQL:

```text
backend/sql/12_seed_home_000002_2esp32.sql
```

Người dùng nhập mã nhà thứ 2:

```text
SMH-HOME-000002
```

## 9. Ghi chú thiết kế

Bản này tập trung vào nền tảng đúng cho nhà thông minh:

```text
User → Home → Area/Floor → Room → Gateway → Device → GPIO
```

ESP32 `voice` chưa điều khiển relay. Nó để chuẩn bị cho giai đoạn sau: wake word, mic, loa, xử lý lệnh giọng nói.
