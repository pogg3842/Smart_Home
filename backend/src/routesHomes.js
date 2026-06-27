const express = require("express");
const { supabase } = require("./supabaseClient");
const { yeuCauDangNhap, yeuCauChuNha } = require("./auth");

const router = express.Router();
router.use(yeuCauDangNhap);

function chuanHoaTenNha(name) {
  return String(name || "").trim().replace(/\s+/g, " ");
}

function chuanHoaMa(value) {
  return String(value || "")
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "");
}

function taoHomeCode(name) {
  const slug = chuanHoaTenNha(name)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 14) || "NHA";

  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `SMH-HOME-${slug}-${rand}`;
}

async function layHomesCuaUser(userId) {
  const { data, error } = await supabase
    .from("home_members")
    .select("role, homes:home_id(id, name, home_code, service_status, owner_id, created_at)")
    .eq("user_id", userId)
    .order("created_at", { ascending: true });

  if (error) throw error;

  return (data || [])
    .filter((row) => row.homes)
    .map((row) => ({
      ...row.homes,
      role: row.role,
      is_owner: row.role === "owner",
    }));
}

router.get("/me/homes", async (req, res) => {
  try {
    const homes = await layHomesCuaUser(req.user.id);
    res.json({ homes });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// V8: người dùng chỉ nhập 1 mã nhà/mã thiết bị. Ai nhập trước thì thành chủ nhà.
router.post("/homes/claim", async (req, res) => {
  const homeCode = chuanHoaMa(req.body?.homeCode || req.body?.code || req.body?.activationCode);

  if (!homeCode || homeCode.length < 6) {
    return res.status(400).json({ error: "Mã thiết bị/mã nhà không hợp lệ" });
  }

  const { data: home, error: findError } = await supabase
    .from("homes")
    .select("id, name, home_code, service_status, owner_id, created_at")
    .eq("home_code", homeCode)
    .maybeSingle();

  if (findError) return res.status(500).json({ error: findError.message });
  if (!home) return res.status(404).json({ error: "Không tìm thấy mã thiết bị/mã nhà này" });

  if (home.service_status !== "active") {
    return res.status(423).json({ error: "Nhà/công trình này đang bị khóa, bảo trì hoặc ngừng dịch vụ" });
  }

  if (home.owner_id && home.owner_id !== req.user.id) {
    return res.status(409).json({ error: "Mã này đã có chủ nhà. Hãy gỡ chủ cũ trước khi đổi chủ." });
  }

  const now = new Date().toISOString();

  if (!home.owner_id) {
    const { data: updatedHome, error: updateError } = await supabase
      .from("homes")
      .update({ owner_id: req.user.id, updated_at: now })
      .eq("id", home.id)
      .is("owner_id", null)
      .select("id, name, home_code, service_status, owner_id, created_at")
      .single();

    if (updateError) return res.status(409).json({ error: "Mã này vừa được tài khoản khác nhận quyền" });
    Object.assign(home, updatedHome);
  }

  const { error: memberError } = await supabase
    .from("home_members")
    .upsert({ home_id: home.id, user_id: req.user.id, role: "owner" }, { onConflict: "home_id,user_id" });

  if (memberError) return res.status(500).json({ error: memberError.message });

  res.status(201).json({ home: { ...home, role: "owner", is_owner: true } });
});

// Dev/internal: tạo nhà nhanh khi chưa có trang nội bộ. Sản phẩm thật nên dùng web nhân viên tạo mã sẵn.
router.post("/homes", async (req, res) => {
  const name = chuanHoaTenNha(req.body?.name);

  if (!name || name.length < 2) {
    return res.status(400).json({ error: "Tên nhà phải có ít nhất 2 ký tự" });
  }

  if (name.length > 80) {
    return res.status(400).json({ error: "Tên nhà không được quá 80 ký tự" });
  }

  const homeCode = chuanHoaMa(req.body?.homeCode) || taoHomeCode(name);

  const { data: home, error: loiTaoHome } = await supabase
    .from("homes")
    .insert({
      name,
      home_code: homeCode,
      owner_id: req.user.id,
      service_status: "active",
    })
    .select("id, name, home_code, service_status, owner_id, created_at")
    .single();

  if (loiTaoHome) return res.status(500).json({ error: loiTaoHome.message });

  const { error: loiThemChuNha } = await supabase.from("home_members").insert({
    home_id: home.id,
    user_id: req.user.id,
    role: "owner",
  });

  if (loiThemChuNha) {
    await supabase.from("homes").delete().eq("id", home.id);
    return res.status(500).json({ error: loiThemChuNha.message });
  }

  await supabase.from("rooms").insert([
    { home_id: home.id, area_name: "Tầng 1", name: "Phòng khách" },
    { home_id: home.id, area_name: "Tầng 1", name: "Phòng ngủ" },
  ]);

  res.status(201).json({ home: { ...home, role: "owner", is_owner: true } });
});

router.post("/homes/:id/release-owner", async (req, res) => {
  const homeId = req.params.id;
  const duocPhep = await yeuCauChuNha(req, res, homeId);
  if (!duocPhep) return;

  // Khi bán nhà/đổi chủ: giữ nguyên nhà, gateway, thiết bị, phòng; chỉ gỡ quyền truy cập.
  const { error: deleteMembersError } = await supabase
    .from("home_members")
    .delete()
    .eq("home_id", homeId);

  if (deleteMembersError) return res.status(500).json({ error: deleteMembersError.message });

  const { data: home, error: updateError } = await supabase
    .from("homes")
    .update({ owner_id: null, updated_at: new Date().toISOString() })
    .eq("id", homeId)
    .select("id, name, home_code, service_status, owner_id, created_at")
    .single();

  if (updateError) return res.status(500).json({ error: updateError.message });

  res.json({ ok: true, home, message: "Đã gỡ chủ nhà. Mã nhà có thể được chủ mới nhập lại." });
});

router.patch("/homes/:id/status", async (req, res) => {
  const homeId = req.params.id;
  const duocPhep = await yeuCauChuNha(req, res, homeId);
  if (!duocPhep) return;

  const status = String(req.body?.serviceStatus || "").trim();
  const hopLe = ["active", "suspended", "maintenance", "terminated"];
  if (!hopLe.includes(status)) {
    return res.status(400).json({ error: "Trạng thái dịch vụ không hợp lệ" });
  }

  const { data, error } = await supabase
    .from("homes")
    .update({ service_status: status, updated_at: new Date().toISOString() })
    .eq("id", homeId)
    .select("id, name, home_code, service_status, owner_id, created_at")
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.json({ home: { ...data, role: "owner", is_owner: true } });
});

module.exports = { router };
