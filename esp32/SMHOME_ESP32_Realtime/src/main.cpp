#include <Arduino.h>
#include <WiFi.h>
#include <WebSocketsClient.h>

#include "CauHinh.h"
#include "ThietBiGPIO.h"
#include "GPIOThietBi.h"
#include "WifiKetNoi.h"
#include "WebSocketKetNoi.h"

// =====================================================
// DANH SÁCH GPIO ĐIỀU KHIỂN THIẾT BỊ
// Chế độ mới: KHÔNG dùng chân DETECT.
// Thiết bị được thêm thủ công trên website và chọn đúng GPIO bên dưới.
//
// Thiết bị 1: GPIO14
// Thiết bị 2: GPIO26
// Thiết bị 3: GPIO33
// Thiết bị 4: GPIO18
// Thiết bị 5: GPIO22
// Thiết bị 6: GPIO21
// =====================================================
ThietBiGPIO danhSachThietBi[] = {
  {14, "Thiet bi 1", "Thiet bi", "den", false},
  {26, "Thiet bi 2", "Thiet bi", "den", false},
  {33, "Thiet bi 3", "Thiet bi", "den", false},
  {18, "Thiet bi 4", "Thiet bi", "den", false},
  {22, "Thiet bi 5", "Thiet bi", "den", false},
  {21, "Thiet bi 6", "Thiet bi", "den", false},
};

const size_t SO_THIET_BI = sizeof(danhSachThietBi) / sizeof(danhSachThietBi[0]);

WebSocketsClient webSocket;
unsigned long lanGuiTrangThaiCuoi = 0;
bool daDuocServerChapNhan = false;

void setup() {
  Serial.begin(115200);
  delay(500);

  Serial.println();
  Serial.println("=====================================================");
  Serial.println("SMART HOME GATEWAY ESP32 - MANUAL DEVICES");
  Serial.println("=====================================================");
  Serial.printf("Gateway ID   : %s\n", ESP32_ID);
  Serial.printf("Gateway name : %s\n", GATEWAY_NAME);
  Serial.printf("Firmware     : %s\n", FIRMWARE_VERSION);
  Serial.printf("WebSocket    : %s://%s:%d%s\n", WS_DUNG_SSL ? "wss" : "ws", WS_HOST, WS_PORT, WS_PATH);
  Serial.printf("Relay mode   : %s\n", RELAY_ACTIVE_LOW ? "ACTIVE LOW" : "ACTIVE HIGH");
  Serial.println("Mode         : Them thiet bi thu cong tren website, khong dung DETECT");
  Serial.println("=====================================================");

  if (!kiemTraTrungPin()) {
    Serial.println("[CANH BAO] Co chan GPIO bi khai bao trung. Hay kiem tra danhSachThietBi.");
  }

  khoiTaoGPIO();
  ketNoiWiFi();
  ketNoiWebSocket();
}

void loop() {
  if (WiFi.status() != WL_CONNECTED) {
    daDuocServerChapNhan = false;
    ketNoiWiFi();
  }

  webSocket.loop();

  if (daDuocServerChapNhan && millis() - lanGuiTrangThaiCuoi >= GUI_TRANG_THAI_MS) {
    lanGuiTrangThaiCuoi = millis();
    guiTrangThaiDinhKy();
  }
}
