import { cauHinhNhaMacDinh, khoaLuuCaiDatNha } from "./duLieuCaiDat.js";

function taoId(prefix, ten) {
  const tenGon = ten
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "") || "moi";

  return `${prefix}-${tenGon}-${Date.now().toString(36)}`;
}

function tenHopLe(ten) {
  return ten.trim().length > 0;
}

export function docCauHinhNha() {
  if (typeof window === "undefined") return cauHinhNhaMacDinh;

  try {
    const duLieuDaLuu = window.localStorage.getItem(khoaLuuCaiDatNha);
    if (!duLieuDaLuu) return cauHinhNhaMacDinh;

    const parsed = JSON.parse(duLieuDaLuu);
    return Array.isArray(parsed) ? parsed : cauHinhNhaMacDinh;
  } catch {
    return cauHinhNhaMacDinh;
  }
}

export function luuCauHinhNha(cauHinh) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(khoaLuuCaiDatNha, JSON.stringify(cauHinh));
}

export function themKhuVuc(cauHinh, ten) {
  if (!tenHopLe(ten)) return cauHinh;

  return [
    ...cauHinh,
    {
      id: taoId("khu-vuc", ten),
      ten: ten.trim(),
      phong: [],
    },
  ];
}

export function suaKhuVuc(cauHinh, khuVucId, tenMoi) {
  if (!tenHopLe(tenMoi)) return cauHinh;

  return cauHinh.map((khuVuc) =>
    khuVuc.id === khuVucId ? { ...khuVuc, ten: tenMoi.trim() } : khuVuc,
  );
}

export function xoaKhuVuc(cauHinh, khuVucId) {
  return cauHinh.filter((khuVuc) => khuVuc.id !== khuVucId);
}

export function themPhong(cauHinh, khuVucId, tenPhong) {
  if (!tenHopLe(tenPhong)) return cauHinh;

  return cauHinh.map((khuVuc) => {
    if (khuVuc.id !== khuVucId) return khuVuc;

    return {
      ...khuVuc,
      phong: [
        ...khuVuc.phong,
        {
          id: taoId("phong", tenPhong),
          ten: tenPhong.trim(),
          thietBi: [],
        },
      ],
    };
  });
}

export function suaPhong(cauHinh, khuVucId, phongId, tenMoi) {
  if (!tenHopLe(tenMoi)) return cauHinh;

  return cauHinh.map((khuVuc) => {
    if (khuVuc.id !== khuVucId) return khuVuc;

    return {
      ...khuVuc,
      phong: khuVuc.phong.map((phong) =>
        phong.id === phongId ? { ...phong, ten: tenMoi.trim() } : phong,
      ),
    };
  });
}

export function xoaPhong(cauHinh, khuVucId, phongId) {
  return cauHinh.map((khuVuc) => {
    if (khuVuc.id !== khuVucId) return khuVuc;
    return { ...khuVuc, phong: khuVuc.phong.filter((phong) => phong.id !== phongId) };
  });
}

export function themThietBi(cauHinh, khuVucId, phongId, thietBiMoi) {
  if (!tenHopLe(thietBiMoi.ten)) return cauHinh;

  return cauHinh.map((khuVuc) => {
    if (khuVuc.id !== khuVucId) return khuVuc;

    return {
      ...khuVuc,
      phong: khuVuc.phong.map((phong) => {
        if (phong.id !== phongId) return phong;

        return {
          ...phong,
          thietBi: [
            ...phong.thietBi,
            {
              id: taoId("thiet-bi", thietBiMoi.ten),
              ten: thietBiMoi.ten.trim(),
              loai: thietBiMoi.loai.trim() || "Thiết bị",
              icon: thietBiMoi.icon || "den",
            },
          ],
        };
      }),
    };
  });
}

export function suaThietBi(cauHinh, khuVucId, phongId, thietBiId, thietBiMoi) {
  if (!tenHopLe(thietBiMoi.ten)) return cauHinh;

  return cauHinh.map((khuVuc) => {
    if (khuVuc.id !== khuVucId) return khuVuc;

    return {
      ...khuVuc,
      phong: khuVuc.phong.map((phong) => {
        if (phong.id !== phongId) return phong;

        return {
          ...phong,
          thietBi: phong.thietBi.map((thietBi) =>
            thietBi.id === thietBiId
              ? {
                  ...thietBi,
                  ten: thietBiMoi.ten.trim(),
                  loai: thietBiMoi.loai.trim() || "Thiết bị",
                  icon: thietBiMoi.icon || thietBi.icon,
                }
              : thietBi,
          ),
        };
      }),
    };
  });
}

export function xoaThietBi(cauHinh, khuVucId, phongId, thietBiId) {
  return cauHinh.map((khuVuc) => {
    if (khuVuc.id !== khuVucId) return khuVuc;

    return {
      ...khuVuc,
      phong: khuVuc.phong.map((phong) => {
        if (phong.id !== phongId) return phong;
        return { ...phong, thietBi: phong.thietBi.filter((thietBi) => thietBi.id !== thietBiId) };
      }),
    };
  });
}
// Chuyển dữ liệu Cài đặt sang dữ liệu khu vực cho phần Điều khiển
export function taoDanhSachKhuVucDieuKhien(cauHinhNha) {
  return cauHinhNha.map((khuVuc) => ({
    id: khuVuc.id,
    name: khuVuc.ten,
    rooms: khuVuc.phong.map((phong) => phong.ten),
  }));
}

// Chọn icon đơn giản theo loại thiết bị
function layIconThietBi(thietBi, phong) {
  const chuoiKiemTra = `${thietBi.icon || ""} ${thietBi.loai || ""} ${phong.ten || ""}`.toLowerCase();

  if (chuoiKiemTra.includes("bếp")) return "bep";
  if (chuoiKiemTra.includes("ngủ")) return "ngu";
  if (chuoiKiemTra.includes("khách")) return "khach";

  return "den";
}

// Chuyển dữ liệu Cài đặt sang danh sách thiết bị điều khiển
export function taoDanhSachThietBiDieuKhien(cauHinhNha) {
  return cauHinhNha.flatMap((khuVuc) =>
    khuVuc.phong.flatMap((phong) =>
      phong.thietBi.map((thietBi) => ({
        // Với dữ liệu từ server, thietBi.id chính là UUID của smart_devices.
        id: thietBi.id,
        khuVucId: khuVuc.id,
        khuVucName: khuVuc.ten,
        roomId: phong.id,
        room: phong.ten,
        name: thietBi.ten,
        icon: layIconThietBi(thietBi, phong),
        gpioPin: thietBi.gpioPin,
        esp32Id: thietBi.esp32Id,
        gatewayName: thietBi.gatewayName,
        esp32Status: thietBi.esp32Status,
        isOn: Boolean(thietBi.isOn),
        isLocked: Boolean(thietBi.isLocked),
        memberCanControl: thietBi.memberCanControl !== false,
        canControl: thietBi.canControl !== false,
        canManage: Boolean(thietBi.canManage),
        homeRole: thietBi.homeRole || "member",
      })),
    ),
  );
}