const { supabase } = require("./supabaseClient");

async function yeuCauDangNhap(req, res, next) {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";

  if (!token) {
    return res.status(401).json({ error: "Thiếu access token" });
  }

  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data?.user) {
    return res.status(401).json({ error: "Token không hợp lệ hoặc đã hết hạn" });
  }

  req.user = data.user;
  next();
}

async function layVaiTroTrongNha(userId, homeId) {
  const { data, error } = await supabase
    .from("home_members")
    .select("role")
    .eq("home_id", homeId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw error;
  return data?.role || null;
}

async function kiemTraQuyenNha(userId, homeId) {
  const role = await layVaiTroTrongNha(userId, homeId);
  return Boolean(role);
}

async function yeuCauQuyenNha(req, res, homeId) {
  if (!homeId) {
    res.status(400).json({ error: "Thiếu homeId" });
    return false;
  }

  const role = await layVaiTroTrongNha(req.user.id, homeId);
  if (!role) {
    res.status(403).json({ error: "Tài khoản này không có quyền vào nhà/thiết bị này" });
    return false;
  }

  req.homeRole = role;
  return true;
}

async function yeuCauChuNha(req, res, homeId) {
  const duocVaoNha = await yeuCauQuyenNha(req, res, homeId);
  if (!duocVaoNha) return false;

  if (req.homeRole !== "owner") {
    res.status(403).json({ error: "Chỉ chủ nhà mới được thực hiện thao tác này" });
    return false;
  }

  return true;
}

module.exports = {
  yeuCauDangNhap,
  layVaiTroTrongNha,
  kiemTraQuyenNha,
  yeuCauQuyenNha,
  yeuCauChuNha,
};
