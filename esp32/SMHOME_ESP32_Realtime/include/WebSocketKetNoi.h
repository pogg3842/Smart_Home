#pragma once

#include <Arduino.h>
#include <WebSocketsClient.h>

extern WebSocketsClient webSocket;
extern unsigned long lanGuiTrangThaiCuoi;
extern bool daDuocServerChapNhan;

void ketNoiWebSocket();
void webSocketEvent(WStype_t type, uint8_t* payload, size_t length);
void guiDeviceHello();
void guiCommandAck(const char* commandId, uint8_t pin, bool success, bool state, const char* message);
void guiTrangThaiDinhKy();
void xuLyLenhServer(const char* payload);
