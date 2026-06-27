import { useEffect, useMemo, useState } from "react";
import { Activity, ChevronDown, Database, Radio, Wifi } from "lucide-react";
import { motion } from "motion/react";

import OThietBi from "./OThietBi.jsx";

const nutNhanMem = {
  whileTap: { scale: 0.97 },
  transition: { type: "spring", stiffness: 520, damping: 34, mass: 0.5 },
};

const nutNhoMem = {
  whileTap: { scale: 0.92 },
  transition: { type: "spring", stiffness: 560, damping: 32, mass: 0.45 },
};

// Component điều khiển danh sách thiết bị và bộ lọc phòng.
export default function BangDieuKhienThietBi({
  devices,
  danhSachKhuVuc = [],
  ketNoi,
  thongKe,
  onToggleDevice,
  onToggleMemberControl,
  isOwner = false,
}) {
  const [menuKhuVucMo, setMenuKhuVucMo] = useState(false);
  const [khuVucChon, setKhuVucChon] = useState("");
  const [phongDangChon, setPhongDangChon] = useState([]);

  const coDuLieuDieuKhien = danhSachKhuVuc.length > 0 && devices.length > 0;

  // Nếu khu vực bị xóa trong Cài đặt, tự reset lại lựa chọn.
  useEffect(() => {
    if (danhSachKhuVuc.length === 0) {
      setKhuVucChon("");
      setPhongDangChon([]);
      setMenuKhuVucMo(false);
      return;
    }

    const khuVucConTonTai = danhSachKhuVuc.some(
      (khuVuc) => khuVuc.id === khuVucChon,
    );

    if (!khuVucConTonTai) {
      setKhuVucChon(danhSachKhuVuc[0].id);
      setPhongDangChon([]);
    }
  }, [danhSachKhuVuc, khuVucChon]);

  const khuVucHienTai = useMemo(
    () => danhSachKhuVuc.find((khuVuc) => khuVuc.id === khuVucChon) ?? danhSachKhuVuc[0],
    [danhSachKhuVuc, khuVucChon],
  );

  const danhSachPhong = khuVucHienTai?.rooms ?? [];
  const dangChonTatCa = phongDangChon.length === 0;

  // Luôn lọc thiết bị theo khu vực trước, tránh lẫn thiết bị của tầng khác.
  const devicesTrongKhuVuc = useMemo(() => {
    if (!coDuLieuDieuKhien || !khuVucHienTai) return [];

    return devices.filter((device) => device.khuVucId === khuVucHienTai.id);
  }, [devices, coDuLieuDieuKhien, khuVucHienTai]);

  const devicesTheoPhong = useMemo(() => {
    if (!coDuLieuDieuKhien) return [];
    if (dangChonTatCa) return devicesTrongKhuVuc;

    return devicesTrongKhuVuc.filter((device) => phongDangChon.includes(device.room));
  }, [devicesTrongKhuVuc, coDuLieuDieuKhien, dangChonTatCa, phongDangChon]);

  function handleChonPhong(room) {
    setPhongDangChon((current) => {
      if (current.length === 0) return [room];

      if (current.includes(room)) {
        return current.filter((item) => item !== room);
      }

      return [...current, room];
    });
  }

  const danhSachKetNoi = [
    {
      id: "esp32",
      icon: Radio,
      title: "ESP32",
      detail: ketNoi.esp32.detail,
      latency: ketNoi.esp32.latency,
      status: ketNoi.esp32.status,
    },
    {
      id: "supabase",
      icon: Database,
      title: "Supabase",
      detail: ketNoi.supabase.detail,
      latency: ketNoi.supabase.latency,
      status: ketNoi.supabase.status,
    },
    {
      id: "wifi",
      icon: Wifi,
      title: "WiFi",
      detail: ketNoi.wifi.detail,
      latency: ketNoi.wifi.latency,
      status: ketNoi.wifi.status,
    },
    {
      id: "devices",
      icon: Activity,
      title: "Thiết bị bật",
      detail: `${thongKe.dangBat}/${thongKe.tong} đang hoạt động`,
      latency: "Live",
      status: thongKe.dangBat > 0 ? "online" : "warn",
    },
  ];

  return (
    <article className="the-ui bang-thiet-bi">
      <div className="dau-the dau-the-thiet-bi">
        <div>
          <p className="nhan-nho">DEVICE CONTROL</p>
          <h2>Điều khiển thiết bị</h2>
        </div>

        <div className="cum-dieu-khien-phai">
          <div className="ket-noi-mini" aria-label="Trạng thái kết nối">
            {danhSachKetNoi.map((item) => (
              <NutKetNoiMini key={item.id} item={item} />
            ))}
          </div>

          {coDuLieuDieuKhien && (
            <div className="loc-phong">
              <motion.button
                type="button"
                className={`nut-loc-phong ${menuKhuVucMo ? "dang-mo" : ""}`}
                aria-expanded={menuKhuVucMo}
                onClick={() => setMenuKhuVucMo((dangMo) => !dangMo)}
                {...nutNhanMem}
              >
                <span className="nut-loc-phong-title">Chọn khu vực</span>
                <small className="nut-loc-phong-current">{khuVucHienTai?.name}</small>
                <ChevronDown size={16} />
              </motion.button>

              <div className={`menu-khu-vuc ${menuKhuVucMo ? "dang-mo" : ""}`} aria-label="Chọn khu vực">
                {danhSachKhuVuc.map((khuVuc) => (
                  <button
                    key={khuVuc.id}
                    type="button"
                    className={khuVuc.id === khuVucChon ? "dang-chon" : ""}
                    onClick={() => {
                      setKhuVucChon(khuVuc.id);
                      setMenuKhuVucMo(false);
                      setPhongDangChon([]);
                    }}
                  >
                    {khuVuc.name}
                  </button>
                ))}
              </div>

              <div className="tag-phong" aria-label="Lọc thiết bị theo phòng">
                {danhSachPhong.map((room) => {
                  const dangChon = phongDangChon.includes(room);

                  return (
                    <motion.button
                      key={room}
                      type="button"
                      className={dangChon ? "dang-chon" : ""}
                      onClick={() => handleChonPhong(room)}
                      whileTap={{ scale: 0.96 }}
                    >
                      {room}
                    </motion.button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {!coDuLieuDieuKhien ? (
        <div className="trang-thai-rong-thiet-bi">
          vui lòng thêm khu vực và thiết bị
        </div>
      ) : (
        <div className="luoi-thiet-bi">
          {devicesTheoPhong.map((device) => (
            <OThietBi
              key={device.id}
              device={device}
              isOwner={isOwner}
              onToggle={() => onToggleDevice(device.id)}
              onToggleMemberControl={onToggleMemberControl}
            />
          ))}
        </div>
      )}
    </article>
  );
}

// Component nút nhỏ mô tả trạng thái kết nối.
function NutKetNoiMini({ item }) {
  const Icon = item.icon;
  const dangOnline = item.status === "online";

  return (
    <motion.button
      type="button"
      className={`nut-ket-noi-mini ${item.status}`}
      aria-label={`${item.title}: ${item.detail}`}
      {...nutNhoMem}
    >
      <Icon size={15} />
      <span className="cham-mini" aria-hidden="true" />

      <span className="tooltip-ket-noi" role="tooltip">
        <strong>{item.title}</strong>
        <span>{item.detail}</span>
        <em>{dangOnline ? "Kết nối thành công" : "Cần kiểm tra"} · {item.latency}</em>
      </span>
    </motion.button>
  );
}