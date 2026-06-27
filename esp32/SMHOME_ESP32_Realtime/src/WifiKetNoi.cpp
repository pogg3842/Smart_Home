#include <Arduino.h>
#include <WiFi.h>

#include "CauHinh.h"
#include "WifiKetNoi.h"

void ketNoiWiFi() {
  if (WiFi.status() == WL_CONNECTED) return;

  Serial.printf("[WiFi] Đang kết nối SSID: %s\n", WIFI_SSID);
  WiFi.mode(WIFI_STA);
  WiFi.setSleep(false);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  unsigned long batDau = millis();
  while (WiFi.status() != WL_CONNECTED && millis() - batDau < 15000) {
    delay(300);
    Serial.print(".");
  }

  Serial.println();

  if (WiFi.status() == WL_CONNECTED) {
    Serial.print("[WiFi] OK - IP: ");
    Serial.println(WiFi.localIP());
    Serial.print("[WiFi] RSSI: ");
    Serial.println(WiFi.RSSI());
  } else {
    Serial.println("[WiFi] Lỗi kết nối, sẽ thử lại trong loop.");
    WiFi.disconnect(true);
    delay(500);
  }
}
