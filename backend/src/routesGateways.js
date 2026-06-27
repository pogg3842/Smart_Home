const express = require("express");
const { supabase } = require("./supabaseClient");
const { yeuCauDangNhap, yeuCauQuyenNha, yeuCauChuNha } = require("./auth");
const { layDanhSachGPIOChoPhep } = require("./deviceManager");

const router = express.Router();
router.use(yeuCauDangNhap);

function chuanHoaMaGhepNoi(value) {
  return String(value || "")
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "");
}

router.get("/gateways", async (req, res) => {
  const homeId = req.query.homeId;
  const duocPhep = await yeuCauQuyenNha(req, res, homeId);
  if (!duocPhep) return;

  const { data, error } = await supabase
    .from("esp32_devices")
    .select("id,name,gateway_role,location_note,status,last_seen_at,created_at,paired_at")
    .eq("home_id", homeId)
    .order("created_at", { ascending: true });

  if (error) return res.status(500).json({ error: error.message });

  const availablePins = layDanhSachGPIOChoPhep();
  const gateways = (data || []).map((gateway) => ({
    ...gateway,
    gateway_role: gateway.gateway_role || "control",
    available_pins: (gateway.gateway_role || "control") === "voice" ? [] : availablePins,
  }));

  res.json({ gateways, role: req.homeRole });
});

router.post("/gateways/pair", async (req, res) => {
  const homeId = req.body?.homeId;
  const pairCode = chuanHoaMaGhepNoi(req.body?.pairCode);

  const duocPhep = await yeuCauChuNha(req, res, homeId);
  if (!duocPhep) return;

  if (!pairCode || pairCode.length < 6) {
    return res.status(400).json({ error: "Mã ghép nối không hợp lệ" });
  }

  const { data: home, error: homeError } = await supabase
    .from("homes")
    .select("id, service_status")
    .eq("id", homeId)
    .maybeSingle();

  if (homeError) return res.status(500).json({ error: homeError.message });
  if (!home) return res.status(404).json({ error: "Không tìm thấy nhà" });
  if (home.service_status !== "active") {
    return res.status(423).json({ error: "Nhà/công trình đang bị khóa dịch vụ, không thể ghép Gateway" });
  }

  const { data: gateway, error: findError } = await supabase
    .from("esp32_devices")
    .select("id,home_id,name,gateway_role,location_note,status,last_seen_at,paired_at")
    .eq("pair_code", pairCode)
    .maybeSingle();

  if (findError) return res.status(500).json({ error: findError.message });
  if (!gateway) return res.status(404).json({ error: "Không tìm thấy Gateway với mã này" });

  if (gateway.home_id && gateway.home_id !== homeId) {
    return res.status(409).json({ error: "Gateway này đã được ghép với một ngôi nhà khác" });
  }

  if (gateway.home_id === homeId) {
    return res.json({ gateway, message: "Gateway đã thuộc ngôi nhà này" });
  }

  const now = new Date().toISOString();
  const { data: updated, error: updateError } = await supabase
    .from("esp32_devices")
    .update({ home_id: homeId, paired_at: now, updated_at: now })
    .eq("id", gateway.id)
    .select("id,name,gateway_role,location_note,status,last_seen_at,created_at,paired_at")
    .single();

  if (updateError) return res.status(500).json({ error: updateError.message });

  res.status(201).json({ gateway: updated, message: "Ghép Gateway thành công" });
});

module.exports = { router };
