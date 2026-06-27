const express = require("express");
const { supabase } = require("./supabaseClient");
const { yeuCauDangNhap, yeuCauQuyenNha, layVaiTroTrongNha } = require("./auth");
const { guiLenhToiESP32, ghiLog, laGPIOChoPhep } = require("./deviceManager");

const router = express.Router();
router.use(yeuCauDangNhap);

function laChuNha(role) {
  return role === "owner";
}

function chuanHoaText(value, fallback = "") {
  const text = String(value || "").trim();
  return text || fallback;
}

async function kiemTraGatewayThuocNha(homeId, esp32Id) {
  const { data, error } = await supabase
    .from("esp32_devices")
    .select("id,home_id,name,status,gateway_role")
    .eq("id", esp32Id)
    .maybeSingle();

  if (error) return { error };
  if (!data) return { error: new Error("Không tìm thấy Gateway") };
  if (data.home_id !== homeId) return { error: new Error("Gateway không thuộc nhà/công trình này") };
  if ((data.gateway_role || "control") === "voice") {
    return { error: new Error("Gateway giọng nói không dùng để điều khiển GPIO/relay") };
  }
  return { gateway: data };
}

router.get("/devices", async (req, res) => {
  const homeId = req.query.homeId;
  const duocPhep = await yeuCauQuyenNha(req, res, homeId);
  if (!duocPhep) return;

  const { data, error } = await supabase
    .from("smart_devices")
    .select("*, esp32_devices(status,last_seen_at,name)")
    .eq("home_id", homeId)
    .eq("is_connected", true)
    .order("created_at", { ascending: true });

  if (error) return res.status(500).json({ error: error.message });

  const devices = (data || []).map((item) => ({
    ...item,
    home_role: req.homeRole,
    can_manage: laChuNha(req.homeRole),
    can_control: laChuNha(req.homeRole) || Boolean(item.member_can_control),
  }));

  res.json({ devices, role: req.homeRole });
});

router.post("/devices", async (req, res) => {
  const {
    homeId,
    esp32Id,
    gpioPin,
    deviceName,
    deviceType,
    areaName,
    roomName,
    icon,
    memberCanControl,
  } = req.body || {};

  const duocPhep = await yeuCauQuyenNha(req, res, homeId);
  if (!duocPhep) return;
  if (!laChuNha(req.homeRole)) {
    return res.status(403).json({ error: "Chỉ chủ nhà mới được thêm thiết bị" });
  }

  const pin = Number(gpioPin);
  if (!Number.isInteger(pin) || !laGPIOChoPhep(pin)) {
    return res.status(400).json({ error: "GPIO không hợp lệ. Hãy chọn GPIO trong danh sách của Gateway" });
  }

  const { error: gatewayError } = await kiemTraGatewayThuocNha(homeId, esp32Id);
  if (gatewayError) return res.status(400).json({ error: gatewayError.message });

  const tenThietBi = chuanHoaText(deviceName, `Thiết bị GPIO${pin}`);
  const loai = chuanHoaText(deviceType, "Thiết bị");
  const khuVuc = chuanHoaText(areaName, "Chưa chọn tầng");
  const phong = chuanHoaText(roomName, "Chưa chọn phòng");

  const { data, error } = await supabase
    .from("smart_devices")
    .insert({
      home_id: homeId,
      esp32_id: esp32Id,
      gpio_pin: pin,
      device_name: tenThietBi,
      device_type: loai,
      icon: chuanHoaText(icon, "den"),
      area_name: khuVuc,
      room_name: phong,
      is_on: false,
      is_connected: true,
      is_locked: false,
      member_can_control: memberCanControl !== false,
    })
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      return res.status(409).json({ error: `GPIO${pin} đã được thêm cho Gateway này` });
    }
    return res.status(500).json({ error: error.message });
  }

  res.status(201).json({ device: data });
});

router.patch("/devices/:id", async (req, res) => {
  const id = req.params.id;
  const {
    deviceName,
    deviceType,
    areaName,
    roomName,
    icon,
    isLocked,
    memberCanControl,
    esp32Id,
    gpioPin,
  } = req.body;

  const { data: device, error: findError } = await supabase
    .from("smart_devices")
    .select("id,home_id,esp32_id,gpio_pin")
    .eq("id", id)
    .maybeSingle();

  if (findError) return res.status(500).json({ error: findError.message });
  if (!device) return res.status(404).json({ error: "Không tìm thấy thiết bị" });

  const role = await layVaiTroTrongNha(req.user.id, device.home_id);
  if (role !== "owner") {
    return res.status(403).json({ error: "Chỉ chủ nhà mới được sửa thiết bị" });
  }

  const updateData = { updated_at: new Date().toISOString() };
  if (deviceName !== undefined) updateData.device_name = chuanHoaText(deviceName, device.device_name || "Thiết bị");
  if (deviceType !== undefined) updateData.device_type = chuanHoaText(deviceType, "Thiết bị");
  if (areaName !== undefined) updateData.area_name = chuanHoaText(areaName, "Chưa chọn tầng");
  if (roomName !== undefined) updateData.room_name = chuanHoaText(roomName, "Chưa chọn phòng");
  if (icon !== undefined) updateData.icon = chuanHoaText(icon, "den");
  if (isLocked !== undefined) updateData.is_locked = Boolean(isLocked);
  if (memberCanControl !== undefined) updateData.member_can_control = Boolean(memberCanControl);

  if (esp32Id !== undefined) {
    const { error: gatewayError } = await kiemTraGatewayThuocNha(device.home_id, esp32Id);
    if (gatewayError) return res.status(400).json({ error: gatewayError.message });
    updateData.esp32_id = esp32Id;
  }

  if (gpioPin !== undefined) {
    const pin = Number(gpioPin);
    if (!Number.isInteger(pin) || !laGPIOChoPhep(pin)) {
      return res.status(400).json({ error: "GPIO không hợp lệ" });
    }
    updateData.gpio_pin = pin;
  }

  const { data, error } = await supabase
    .from("smart_devices")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      return res.status(409).json({ error: "Gateway này đã có thiết bị dùng GPIO đó" });
    }
    return res.status(500).json({ error: error.message });
  }

  res.json({ device: data });
});

router.delete("/devices/:id", async (req, res) => {
  const id = req.params.id;

  const { data: device, error: findError } = await supabase
    .from("smart_devices")
    .select("id,home_id")
    .eq("id", id)
    .maybeSingle();

  if (findError) return res.status(500).json({ error: findError.message });
  if (!device) return res.status(404).json({ error: "Không tìm thấy thiết bị" });

  const role = await layVaiTroTrongNha(req.user.id, device.home_id);
  if (role !== "owner") {
    return res.status(403).json({ error: "Chỉ chủ nhà mới được xóa thiết bị" });
  }

  const { error } = await supabase.from("smart_devices").delete().eq("id", id);
  if (error) return res.status(500).json({ error: error.message });

  res.json({ ok: true });
});

router.post("/devices/:id/command", async (req, res) => {
  const id = req.params.id;
  const state = Boolean(req.body.state);

  const { data: device, error: findError } = await supabase
    .from("smart_devices")
    .select("id,home_id,esp32_id,gpio_pin,device_name,is_on,is_connected,member_can_control")
    .eq("id", id)
    .maybeSingle();

  if (findError) return res.status(500).json({ error: findError.message });
  if (!device) return res.status(404).json({ error: "Không tìm thấy thiết bị" });

  const role = await layVaiTroTrongNha(req.user.id, device.home_id);
  if (!role) return res.status(403).json({ error: "Không có quyền điều khiển thiết bị" });
  if (role !== "owner" && !device.member_can_control) {
    return res.status(403).json({ error: "Chủ nhà đã khóa quyền điều khiển thiết bị này đối với thành viên" });
  }

  const { data: home, error: homeError } = await supabase
    .from("homes")
    .select("service_status")
    .eq("id", device.home_id)
    .maybeSingle();

  if (homeError) return res.status(500).json({ error: homeError.message });
  if (home?.service_status && home.service_status !== "active") {
    return res.status(423).json({ error: "Dịch vụ của nhà/công trình này đang bị khóa hoặc bảo trì" });
  }

  if (!device.is_connected) return res.status(409).json({ error: "Thiết bị đã bị ẩn hoặc chưa được thêm thủ công" });

  try {
    const ack = await guiLenhToiESP32({
      esp32Id: device.esp32_id,
      pin: device.gpio_pin,
      state,
    });

    const { data: updated, error: updateError } = await supabase
      .from("smart_devices")
      .update({ is_on: state, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (updateError) throw updateError;

    await ghiLog({
      homeId: device.home_id,
      deviceId: id,
      userId: req.user.id,
      action: state ? "ON" : "OFF",
      success: true,
      message: `GPIO${device.gpio_pin} OK`,
    });

    res.json({ ok: true, ack, device: updated });
  } catch (error) {
    await ghiLog({
      homeId: device.home_id,
      deviceId: id,
      userId: req.user.id,
      action: state ? "ON" : "OFF",
      success: false,
      message: error.message,
    });

    res.status(503).json({ error: error.message });
  }
});

module.exports = { router };
