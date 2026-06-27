#pragma once

#include <Arduino.h>

// Chế độ mới: không dùng chân DETECT.
// Mỗi thiết bị chỉ có 1 chân GPIO để bật/tắt LED/relay.
struct ThietBiGPIO {
  uint8_t pinDieuKhien;
  const char* tenMacDinh;
  const char* loai;
  const char* icon;
  bool trangThai;
};

extern ThietBiGPIO danhSachThietBi[];
extern const size_t SO_THIET_BI;
