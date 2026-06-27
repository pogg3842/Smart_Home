const crypto = require("crypto");
const { supabase } = require("./supabaseClient");

const thietBiDangOnline = new Map();
const lenhDangCho = new Map();

// GPIO đã khai báo trong firmware ESP32 hiện tại.
// Website sẽ cho chủ nhà chọn đúng các chân này khi thêm thiết bị thủ công.
const GPIO_CHO_PHEP = [14, 26, 33, 18, 22, 21];

function layDanhSachGPIOChoPhep() {
  return GPIO_CHO_PHEP.map((pin, index) => ({
    port: index + 1,
    pin,
    label: `Cổng ${index + 1} - GPIO${pin}`,
  }));
}

function laGPIOChoPhep(pin) {
  return GPIO_CHO_PHEP.includes(Number(pin));
}

function taoChuKy(deviceId, nonce, secret) {
  return crypto
    .createHmac("sha256", secret)
    .update(`${deviceId}.${nonce}`)
    .digest("hex");
}

function soSanhAnToan(a, b) {
  const aa = Buffer.from(String(a || ""));
  const bb = Buffer.from(String(b || ""));
  if (aa.length !== bb.length) return false;
  return crypto.timingSafeEqual(aa, bb);
}

async function xacThucESP32({ deviceId, homeId, nonce, signature }) {
  if (!deviceId || !nonce || !signature) {
    return { ok: false, error: "Thiếu thông tin xác thực Gateway" };
  }

  const { data: device, error } = await supabase
    .from("esp32_devices")
    .select("id, home_id, device_secret, status, name")
    .eq("id", deviceId)
    .maybeSingle();

  if (error) return { ok: false, error: error.message };
  if (!device) return { ok: false, error: "Gateway chưa được đăng ký trong hệ thống" };
  if (!device.home_id) return { ok: false, error: "Gateway chưa được ghép với ngôi nhà nào" };
  if (homeId && device.home_id !== homeId) return { ok: false, error: "Gateway không thuộc ngôi nhà này" };
  if (!device.device_secret) return { ok: false, error: "Gateway chưa có khóa bảo mật" };

  const expected = taoChuKy(deviceId, nonce, device.device_secret);
  if (!soSanhAnToan(expected, signature)) {
    return { ok: false, error: "Sai chữ ký Gateway" };
  }

  return { ok: true, device, homeId: device.home_id };
}

async function capNhatEsp32Online({ deviceId, online }) {
  if (!deviceId) return;

  const now = new Date().toISOString();
  const updateData = {
    status: online ? "online" : "offline",
    updated_at: now,
  };

  if (online) updateData.last_seen_at = now;

  await supabase
    .from("esp32_devices")
    .update(updateData)
    .eq("id", deviceId);
}

// Chế độ manual: ESP32 KHÔNG tự tạo/xóa thiết bị nữa.
// Website mới là nơi thêm/xóa thiết bị theo GPIO.
// Hàm này chỉ giữ lại để tương thích với bản cũ, nhưng không ẩn/hiện thiết bị theo detect.
async function dongBoDanhSachGPIO({ deviceId, homeId, devices = [] }) {
  if (!deviceId || !homeId || !Array.isArray(devices)) return;

  // Không làm gì trong chế độ manual.
  // Nếu sau này cần tự đồng bộ GPIO từ firmware, hãy tạo chế độ riêng.
}

async function capNhatTrangThaiGPIO({ deviceId, homeId, states = [] }) {
  if (!deviceId || !homeId || !Array.isArray(states)) return;

  for (const item of states) {
    const gpioPin = Number(item.pin);
    if (!Number.isInteger(gpioPin)) continue;

    const { error } = await supabase
      .from("smart_devices")
      .update({
        is_on: Boolean(item.state),
        updated_at: new Date().toISOString(),
      })
      .eq("home_id", homeId)
      .eq("esp32_id", deviceId)
      .eq("gpio_pin", gpioPin)
      .eq("is_connected", true);

    if (error) console.warn("[Supabase] Lỗi cập nhật trạng thái GPIO:", error.message);
  }
}

async function ghiLog({ homeId, deviceId, userId, action, success, message }) {
  await supabase.from("device_logs").insert({
    home_id: homeId,
    smart_device_id: deviceId || null,
    user_id: userId || null,
    action,
    success,
    message,
  });
}

function dangKySocketESP32({ deviceId, homeId, ws }) {
  thietBiDangOnline.set(deviceId, { ws, homeId, connectedAt: Date.now() });
}

function goSocketESP32(deviceId) {
  thietBiDangOnline.delete(deviceId);
}

function guiLenhToiESP32({ esp32Id, pin, state }) {
  const ketNoi = thietBiDangOnline.get(esp32Id);
  if (!ketNoi || ketNoi.ws.readyState !== 1) {
    return Promise.reject(new Error("Gateway đang offline"));
  }

  const commandId = crypto.randomUUID();
  const payload = {
    type: "COMMAND",
    commandId,
    pin: Number(pin),
    state: Boolean(state),
  };

  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      lenhDangCho.delete(commandId);
      reject(new Error("Gateway không phản hồi lệnh"));
    }, 5000);

    lenhDangCho.set(commandId, { resolve, reject, timeout });
    ketNoi.ws.send(JSON.stringify(payload));
  });
}

function xuLyAckTuESP32(message) {
  const pending = lenhDangCho.get(message.commandId);
  if (!pending) return;

  clearTimeout(pending.timeout);
  lenhDangCho.delete(message.commandId);

  if (message.success) {
    pending.resolve(message);
  } else {
    pending.reject(new Error(message.message || "Gateway báo thực thi thất bại"));
  }
}

async function danhDauGatewayQuaHanOffline({ quaHanMs = 30000 } = {}) {
  const cutoffMs = Date.now() - quaHanMs;

  const { data, error } = await supabase
    .from("esp32_devices")
    .select("id,last_seen_at")
    .eq("status", "online");

  if (error) {
    console.warn("[Watchdog] Không kiểm tra được Gateway quá hạn:", error.message);
    return;
  }

  const quaHan = (data || [])
    .filter((item) => !item.last_seen_at || new Date(item.last_seen_at).getTime() < cutoffMs)
    .map((item) => item.id);

  if (!quaHan.length) return;

  const { error: updateError } = await supabase
    .from("esp32_devices")
    .update({ status: "offline", updated_at: new Date().toISOString() })
    .in("id", quaHan);

  if (updateError) {
    console.warn("[Watchdog] Không chuyển offline được:", updateError.message);
    return;
  }

  for (const id of quaHan) {
    thietBiDangOnline.delete(id);
    console.log(`[Watchdog] Gateway quá hạn heartbeat, chuyển Offline: ${id}`);
  }
}

module.exports = {
  GPIO_CHO_PHEP,
  layDanhSachGPIOChoPhep,
  laGPIOChoPhep,
  xacThucESP32,
  capNhatEsp32Online,
  dongBoDanhSachGPIO,
  capNhatTrangThaiGPIO,
  ghiLog,
  dangKySocketESP32,
  goSocketESP32,
  guiLenhToiESP32,
  xuLyAckTuESP32,
  danhDauGatewayQuaHanOffline,
};
