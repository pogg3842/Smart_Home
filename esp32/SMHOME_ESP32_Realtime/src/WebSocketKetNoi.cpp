#include <Arduino.h>
#include <ArduinoJson.h>
#include <WiFi.h>

#include "CauHinh.h"
#include "BaoMatHMAC.h"
#include "GPIOThietBi.h"
#include "ThietBiGPIO.h"
#include "WebSocketKetNoi.h"

static void themDanhSachGPIOHoTro(DynamicJsonDocument& doc) {
  JsonArray arr = doc.createNestedArray("availablePins");
  for (size_t i = 0; i < SO_THIET_BI; i++) {
    JsonObject o = arr.createNestedObject();
    o["port"] = (int)(i + 1);
    o["pin"] = danhSachThietBi[i].pinDieuKhien;
    o["name"] = danhSachThietBi[i].tenMacDinh;
    o["type"] = danhSachThietBi[i].loai;
    o["icon"] = danhSachThietBi[i].icon;
  }
}

void ketNoiWebSocket() {
  if (WS_DUNG_SSL) {
    webSocket.beginSSL(WS_HOST, WS_PORT, WS_PATH);
  } else {
    webSocket.begin(WS_HOST, WS_PORT, WS_PATH);
  }

  webSocket.onEvent(webSocketEvent);
  webSocket.setReconnectInterval(3000);
  webSocket.enableHeartbeat(15000, 3000, 2);

  Serial.printf(
    "[WS] Ket noi toi %s://%s:%d%s\n",
    WS_DUNG_SSL ? "wss" : "ws",
    WS_HOST,
    WS_PORT,
    WS_PATH
  );
}

void webSocketEvent(WStype_t type, uint8_t* payload, size_t length) {
  switch (type) {
    case WStype_CONNECTED:
      Serial.println("[WS] Da ket noi server");
      daDuocServerChapNhan = false;
      guiDeviceHello();
      break;

    case WStype_DISCONNECTED:
      Serial.println("[WS] Mat ket noi server");
      daDuocServerChapNhan = false;
      break;

    case WStype_TEXT:
      xuLyLenhServer(reinterpret_cast<const char*>(payload));
      break;

    default:
      break;
  }
}

void guiDeviceHello() {
  String nonce = String(millis()) + "-" + String(random(100000, 999999));
  String dataKy = String(ESP32_ID) + "." + nonce;
  String signature = hmacSha256Hex(dataKy, DEVICE_SECRET);

  DynamicJsonDocument doc(4096);
  doc["type"] = "DEVICE_HELLO";
  doc["deviceId"] = ESP32_ID;
  doc["gatewayName"] = GATEWAY_NAME;
  doc["nonce"] = nonce;
  doc["signature"] = signature;
  doc["firmware"] = FIRMWARE_VERSION;
  doc["chip"] = "ESP32";
  doc["ip"] = WiFi.localIP().toString();
  doc["wifi"] = WIFI_SSID;
  doc["manualDeviceMode"] = true;
  doc["detectMode"] = false;
  doc["relayActiveLow"] = (bool)RELAY_ACTIVE_LOW;

  themDanhSachGPIOHoTro(doc);

  String out;
  serializeJson(doc, out);
  webSocket.sendTXT(out);
  Serial.printf("[WS] Da gui DEVICE_HELLO | Gateway=%s | GPIO ho tro=%u\n", ESP32_ID, (unsigned)demThietBiKhaiBao());
}

void xuLyLenhServer(const char* payload) {
  DynamicJsonDocument doc(1024);
  DeserializationError error = deserializeJson(doc, payload);
  if (error) {
    Serial.print("[WS] JSON loi: ");
    Serial.println(error.c_str());
    return;
  }

  const char* type = doc["type"] | "";

  if (strcmp(type, "DEVICE_ACCEPTED") == 0) {
    daDuocServerChapNhan = true;
    Serial.println("[WS] Server da chap nhan Gateway");
    guiTrangThaiDinhKy();
    return;
  }

  if (strcmp(type, "COMMAND") == 0) {
    const char* commandId = doc["commandId"] | "";
    uint8_t pin = doc["pin"] | 255;
    bool state = doc["state"] | false;

    bool ok = datTrangThaiGPIO(pin, state);
    guiCommandAck(
      commandId,
      pin,
      ok,
      state,
      ok ? "OK" : "GPIO khong nam trong danh sach firmware"
    );
    return;
  }

  if (strcmp(type, "PING") == 0) {
    guiTrangThaiDinhKy();
    return;
  }

  if (strcmp(type, "ERROR") == 0) {
    Serial.print("[WS] Server bao loi: ");
    Serial.println(doc["message"] | "unknown");
    return;
  }

  Serial.print("[WS] Bo qua type khong ho tro: ");
  Serial.println(type);
}

void guiCommandAck(const char* commandId, uint8_t pin, bool success, bool state, const char* message) {
  DynamicJsonDocument doc(768);
  doc["type"] = "COMMAND_ACK";
  doc["deviceId"] = ESP32_ID;
  doc["commandId"] = commandId;
  doc["pin"] = pin;
  doc["success"] = success;
  doc["state"] = state;
  doc["message"] = message;

  String out;
  serializeJson(doc, out);
  webSocket.sendTXT(out);
}

void guiTrangThaiDinhKy() {
  DynamicJsonDocument doc(4096);
  doc["type"] = "DEVICE_STATUS";
  doc["deviceId"] = ESP32_ID;
  doc["gatewayName"] = GATEWAY_NAME;
  doc["manualDeviceMode"] = true;
  doc["detectMode"] = false;
  doc["firmware"] = FIRMWARE_VERSION;
  doc["freeHeap"] = ESP.getFreeHeap();
  doc["rssi"] = WiFi.RSSI();

  JsonArray arr = doc.createNestedArray("states");
  for (size_t i = 0; i < SO_THIET_BI; i++) {
    JsonObject o = arr.createNestedObject();
    o["port"] = (int)(i + 1);
    o["pin"] = danhSachThietBi[i].pinDieuKhien;
    o["state"] = danhSachThietBi[i].trangThai;
  }

  String out;
  serializeJson(doc, out);
  webSocket.sendTXT(out);
  Serial.printf("[WS] Da gui DEVICE_STATUS | Gateway=%s | GPIO=%u\n", ESP32_ID, (unsigned)demThietBiKhaiBao());
}
