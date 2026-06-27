// Tính thống kê thiết bị cho phần trạng thái nhanh.
export function tinhThongKeThietBi(devices) {
  const tong = devices.length;
  const dangBat = devices.filter((device) => device.isOn).length;

  return {
    tong,
    dangBat,
  };
}

// Đổi trạng thái bật/tắt của một thiết bị trong UI mẫu.
export function doiTrangThaiThietBi(devices, deviceId) {
  return devices.map((device) => {
    if (device.id !== deviceId) return device;

    return {
      ...device,
      isOn: !device.isOn,
    };
  });
}

// Đồng bộ thiết bị từ Cài đặt, nhưng giữ trạng thái bật/tắt cũ nếu còn cùng id.
export function dongBoDanhSachThietBi(devicesHienTai, devicesMoi) {
  const trangThaiCu = new Map(
    devicesHienTai.map((device) => [device.id, device.isOn]),
  );

  return devicesMoi.map((device) => ({
    ...device,
    isOn: trangThaiCu.get(device.id) ?? device.isOn ?? false,
  }));
}