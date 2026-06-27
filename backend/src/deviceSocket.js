const {
  xacThucESP32,
  capNhatEsp32Online,
  dongBoDanhSachGPIO,
  capNhatTrangThaiGPIO,
  dangKySocketESP32,
  goSocketESP32,
  xuLyAckTuESP32,
} = require("./deviceManager");

function khoiTaoDeviceSocket(wss) {
  wss.on("connection", (ws, req) => {
    if (req.url !== "/device") {
      ws.close(1008, "Sai đường dẫn WebSocket");
      return;
    }

    let daXacThuc = false;
    let deviceId = "";
    let homeId = "";

    const timerXacThuc = setTimeout(() => {
      if (!daXacThuc) ws.close(1008, "Chưa xác thực ESP32");
    }, 5000);

    ws.on("message", async (raw) => {
      let msg;
      try {
        msg = JSON.parse(raw.toString());
      } catch {
        ws.send(JSON.stringify({ type: "ERROR", message: "JSON không hợp lệ" }));
        return;
      }

      if (!daXacThuc) {
        if (msg.type !== "DEVICE_HELLO") {
          ws.close(1008, "Cần DEVICE_HELLO trước");
          return;
        }

        const ketQua = await xacThucESP32({
          deviceId: msg.deviceId,
          homeId: msg.homeId,
          nonce: msg.nonce,
          signature: msg.signature,
        });

        if (!ketQua.ok) {
          ws.close(1008, ketQua.error || "ESP32 xác thực thất bại");
          return;
        }

        daXacThuc = true;
        clearTimeout(timerXacThuc);

        deviceId = msg.deviceId;
        homeId = ketQua.homeId;

        dangKySocketESP32({ deviceId, homeId, ws });
        await capNhatEsp32Online({ deviceId, online: true });
        await dongBoDanhSachGPIO({ deviceId, homeId, devices: msg.devices || [] });

        ws.send(JSON.stringify({ type: "DEVICE_ACCEPTED", deviceId, homeId }));
        console.log(`[ESP32] Online: ${deviceId} / ${homeId}`);
        return;
      }

      if (msg.type === "COMMAND_ACK") {
        xuLyAckTuESP32(msg);
        return;
      }

      if (msg.type === "DEVICE_STATUS") {
        await capNhatEsp32Online({ deviceId, online: true });

        // Stage 4D: ESP32 gửi danh sách thiết bị đang cắm theo chân DETECT.
        // Backend đồng bộ để web chỉ hiện thiết bị thật sự đang được cắm.
        if (Array.isArray(msg.devices)) {
          await dongBoDanhSachGPIO({ deviceId, homeId, devices: msg.devices || [] });
        }

        await capNhatTrangThaiGPIO({ deviceId, homeId, states: msg.states || [] });
      }
    });

    ws.on("close", async () => {
      clearTimeout(timerXacThuc);
      if (deviceId) {
        goSocketESP32(deviceId);
        await capNhatEsp32Online({ deviceId, online: false });
        console.log(`[ESP32] Offline: ${deviceId}`);
      }
    });
  });
}

module.exports = { khoiTaoDeviceSocket };
