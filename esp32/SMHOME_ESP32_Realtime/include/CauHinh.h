#pragma once

// =====================================================
// FILE CẤU HÌNH CHÍNH
// Khi đổi sang ESP32 thứ 2, bạn chỉ cần sửa các dòng trong phần 1.
// =====================================================

// 1) THÔNG TIN RIÊNG CỦA ESP32 GATEWAY
#define ESP32_ID "SMH-GW-000001-CTRL-01"
#define DEVICE_SECRET "secret-000001-ctrl-01"
#define GATEWAY_NAME "Bo dieu khien nha 000001"

// 2) WIFI ESP32 SẼ KẾT NỐI
#define WIFI_SSID "Lac Hong University"
#define WIFI_PASSWORD ""

// 3) BACKEND / WEBSOCKET SERVER
#define WS_HOST "10.0.12.76"
#define WS_PORT 3000
#define WS_PATH "/device"
#define WS_DUNG_SSL 0

// 4) THỜI GIAN GỬI TRẠNG THÁI
// Không dùng DETECT nữa, website tự thêm thiết bị thủ công theo GPIO.
#define GUI_TRANG_THAI_MS 2000

// 5) LOẠI RELAY
// LED test hoặc relay active HIGH: để 0
// Relay active LOW: đổi thành 1
#define RELAY_ACTIVE_LOW 0

#define FIRMWARE_VERSION "1.4.0-v8-manual-control"
