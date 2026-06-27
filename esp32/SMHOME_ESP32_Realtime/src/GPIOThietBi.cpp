#include <Arduino.h>

#include "CauHinh.h"
#include "ThietBiGPIO.h"
#include "GPIOThietBi.h"

static void ghiChanDieuKhien(uint8_t pin, bool bat) {
#if RELAY_ACTIVE_LOW
  digitalWrite(pin, bat ? LOW : HIGH);
#else
  digitalWrite(pin, bat ? HIGH : LOW);
#endif
}

bool kiemTraTrungPin() {
  bool hopLe = true;

  for (size_t i = 0; i < SO_THIET_BI; i++) {
    for (size_t j = i + 1; j < SO_THIET_BI; j++) {
      if (danhSachThietBi[i].pinDieuKhien == danhSachThietBi[j].pinDieuKhien) {
        Serial.printf("[GPIO] Loi: thiet bi %u va %u bi trung GPIO%d\n", (unsigned)(i + 1), (unsigned)(j + 1), danhSachThietBi[i].pinDieuKhien);
        hopLe = false;
      }
    }
  }

  return hopLe;
}

void khoiTaoGPIO() {
  for (size_t i = 0; i < SO_THIET_BI; i++) {
    pinMode(danhSachThietBi[i].pinDieuKhien, OUTPUT);
    danhSachThietBi[i].trangThai = false;
    ghiChanDieuKhien(danhSachThietBi[i].pinDieuKhien, false);

    Serial.printf(
      "[GPIO] Cong %u | CONTROL=GPIO%d | %s\n",
      (unsigned)(i + 1),
      danhSachThietBi[i].pinDieuKhien,
      danhSachThietBi[i].tenMacDinh
    );
  }
}

size_t demThietBiKhaiBao() {
  return SO_THIET_BI;
}

void tatTatCaThietBi() {
  for (size_t i = 0; i < SO_THIET_BI; i++) {
    danhSachThietBi[i].trangThai = false;
    ghiChanDieuKhien(danhSachThietBi[i].pinDieuKhien, false);
  }
}

bool datTrangThaiGPIO(uint8_t pin, bool bat) {
  for (size_t i = 0; i < SO_THIET_BI; i++) {
    if (danhSachThietBi[i].pinDieuKhien != pin) continue;

    danhSachThietBi[i].trangThai = bat;
    ghiChanDieuKhien(pin, bat);

    Serial.printf("[GPIO] GPIO%d -> %s\n", pin, bat ? "ON" : "OFF");
    return true;
  }

  Serial.printf("[GPIO] Tu choi pin khong hop le: GPIO%d\n", pin);
  return false;
}
