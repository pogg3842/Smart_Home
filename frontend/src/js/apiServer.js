const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

function taoHeader(token) {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

async function docJson(response) {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    return { error: new Error(data.error || `HTTP ${response.status}`), data: null };
  }
  return { error: null, data };
}

export async function layHomesCuaToi(token) {
  const response = await fetch(`${API_BASE_URL}/api/me/homes`, {
    headers: taoHeader(token),
  });
  const { data, error } = await docJson(response);
  return { homes: data?.homes || [], error };
}


export async function taoHomeMoi(name, token) {
  const response = await fetch(`${API_BASE_URL}/api/homes`, {
    method: "POST",
    headers: taoHeader(token),
    body: JSON.stringify({ name }),
  });
  const { data, error } = await docJson(response);
  return { home: data?.home || null, error };
}

export async function layThietBiTheoNha(homeId, token) {
  const response = await fetch(`${API_BASE_URL}/api/devices?homeId=${encodeURIComponent(homeId)}`, {
    headers: taoHeader(token),
  });
  const { data, error } = await docJson(response);
  return { devices: data?.devices || [], error };
}

export async function guiLenhThietBiServer(deviceId, state, token) {
  const response = await fetch(`${API_BASE_URL}/api/devices/${encodeURIComponent(deviceId)}/command`, {
    method: "POST",
    headers: taoHeader(token),
    body: JSON.stringify({ state }),
  });
  const { data, error } = await docJson(response);
  return { device: data?.device || null, error };
}


export async function taoThietBiServer(duLieu, token) {
  const response = await fetch(`${API_BASE_URL}/api/devices`, {
    method: "POST",
    headers: taoHeader(token),
    body: JSON.stringify(duLieu),
  });
  const { data, error } = await docJson(response);
  return { device: data?.device || null, error };
}

export async function capNhatThietBiServer(deviceId, duLieu, token) {
  const response = await fetch(`${API_BASE_URL}/api/devices/${encodeURIComponent(deviceId)}`, {
    method: "PATCH",
    headers: taoHeader(token),
    body: JSON.stringify(duLieu),
  });
  const { data, error } = await docJson(response);
  return { device: data?.device || null, error };
}

export async function xoaThietBiServer(deviceId, token) {
  const response = await fetch(`${API_BASE_URL}/api/devices/${encodeURIComponent(deviceId)}`, {
    method: "DELETE",
    headers: taoHeader(token),
  });
  const { error } = await docJson(response);
  return { error };
}

function iconTheoLoai(row) {
  const text = `${row.icon || ""} ${row.device_type || ""} ${row.room_name || ""}`.toLowerCase();
  if (text.includes("bếp")) return "bep";
  if (text.includes("ngủ")) return "ngu";
  if (text.includes("khách")) return "khach";
  return row.icon || "den";
}

export function chuyenRowsThanhCauHinhNha(rows) {
  const mapKhuVuc = new Map();

  for (const row of rows || []) {
    const khuVucTen = row.area_name || "Tầng 1";
    const phongTen = row.room_name || "Chưa chọn phòng";
    const khuVucId = `area-${khuVucTen}`;
    const phongId = `room-${khuVucTen}-${phongTen}`;

    if (!mapKhuVuc.has(khuVucId)) {
      mapKhuVuc.set(khuVucId, {
        id: khuVucId,
        ten: khuVucTen,
        phong: [],
        mapPhong: new Map(),
      });
    }

    const khuVuc = mapKhuVuc.get(khuVucId);
    if (!khuVuc.mapPhong.has(phongId)) {
      const phong = { id: phongId, ten: phongTen, thietBi: [] };
      khuVuc.mapPhong.set(phongId, phong);
      khuVuc.phong.push(phong);
    }

    khuVuc.mapPhong.get(phongId).thietBi.push({
      id: row.id,
      ten: row.device_name || `GPIO ${row.gpio_pin}`,
      loai: row.device_type || "Thiết bị",
      icon: iconTheoLoai(row),
      gpioPin: row.gpio_pin,
      esp32Id: row.esp32_id,
      gatewayName: row.esp32_devices?.name || row.esp32_id,
      isOn: Boolean(row.is_on),
      esp32Status: row.esp32_devices?.status || "offline",
      isLocked: Boolean(row.is_locked),
      memberCanControl: row.member_can_control !== false,
      canControl: row.can_control !== false,
      canManage: Boolean(row.can_manage),
      homeRole: row.home_role || "member",
    });
  }

  return Array.from(mapKhuVuc.values()).map(({ mapPhong, ...khuVuc }) => khuVuc);
}

export async function layGatewaysTheoNha(homeId, token) {
  const response = await fetch(`${API_BASE_URL}/api/gateways?homeId=${encodeURIComponent(homeId)}`, {
    headers: taoHeader(token),
  });
  const { data, error } = await docJson(response);
  return { gateways: data?.gateways || [], error };
}

export async function ghepGateway(homeId, pairCode, token) {
  const response = await fetch(`${API_BASE_URL}/api/gateways/pair`, {
    method: "POST",
    headers: taoHeader(token),
    body: JSON.stringify({ homeId, pairCode }),
  });
  const { data, error } = await docJson(response);
  return { gateway: data?.gateway || null, message: data?.message || "", error };
}

export async function nhanQuyenNhaBangMa(homeCode, token) {
  const response = await fetch(`${API_BASE_URL}/api/homes/claim`, {
    method: "POST",
    headers: taoHeader(token),
    body: JSON.stringify({ homeCode }),
  });
  const { data, error } = await docJson(response);
  return { home: data?.home || null, error };
}

export async function goKetNoiChuNha(homeId, token) {
  const response = await fetch(`${API_BASE_URL}/api/homes/${encodeURIComponent(homeId)}/release-owner`, {
    method: "POST",
    headers: taoHeader(token),
  });
  const { data, error } = await docJson(response);
  return { ok: Boolean(data?.ok), message: data?.message || "", error };
}
