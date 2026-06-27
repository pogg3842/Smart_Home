import { useEffect, useMemo, useState } from "react";
import { MotionConfig } from "motion/react";

import TieuDeUngDung from "./components/TieuDeUngDung.jsx";
import BangDieuKhienThietBi from "./components/BangDieuKhienThietBi.jsx";
import ONhapLenh from "./components/ONhapLenh.jsx";
import OMicroThietBi from "./components/OMicroThietBi.jsx";
import BangNangCao from "./components/BangNangCao.jsx";
import BangCaiDat from "./components/BangCaiDat.jsx";
import GhepGateway from "./components/GhepGateway.jsx";

import { useAuth } from "./auth/AuthProvider.jsx";
import { cheDoUi } from "./js/cheDoUi.js";
import { trangThaiKetNoiMau } from "./js/duLieuHeThong.js";
import {
  chuyenRowsThanhCauHinhNha,
  guiLenhThietBiServer,
  layGatewaysTheoNha,
  ghepGateway,
  layThietBiTheoNha,
  capNhatThietBiServer,
} from "./js/apiServer.js";
import {
  taoDanhSachKhuVucDieuKhien,
  taoDanhSachThietBiDieuKhien,
} from "./js/xuLyCaiDat.js";
import {
  tinhThongKeThietBi,
  dongBoDanhSachThietBi,
} from "./js/xuLyThietBi.js";

// App chính: UI gọi backend thật, backend mới được nói chuyện với Supabase và ESP32.
export default function App() {
  const { session, homes, activeHome, setActiveHome, nhanNhaBangMa, goChuNha } = useAuth();
  const [cheDoHienTai, setCheDoHienTai] = useState(cheDoUi.CO_BAN);
  const [cauHinhNha, setCauHinhNha] = useState([]);
  const [devices, setDevices] = useState([]);
  const [gateways, setGateways] = useState([]);
  const [dangTaiGateway, setDangTaiGateway] = useState(false);
  const [loiGateway, setLoiGateway] = useState("");
  const [lenhNhap, setLenhNhap] = useState("");
  const [caiDatMo, setCaiDatMo] = useState(false);
  const [trangThaiServer, setTrangThaiServer] = useState("checking");
  const [loiHeThong, setLoiHeThong] = useState("");
  const [laMobile, setLaMobile] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(max-width: 760px)").matches;
  });

  const token = session?.access_token || "";
  const laChuNha = activeHome?.role === "owner";
  const dichVuDangKhoa = activeHome?.service_status && activeHome.service_status !== "active";

  // Mobile chỉ render tab đang xem để giảm DOM và animation trên máy yếu.
  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 760px)");

    function capNhatKichThuoc() {
      setLaMobile(mediaQuery.matches);
    }

    capNhatKichThuoc();
    mediaQuery.addEventListener("change", capNhatKichThuoc);

    return () => {
      mediaQuery.removeEventListener("change", capNhatKichThuoc);
    };
  }, []);

  async function taiGatewaysTuServer() {
    if (!activeHome?.id || !token) return;

    setDangTaiGateway(true);
    const { gateways: rows, error } = await layGatewaysTheoNha(activeHome.id, token);
    if (error) {
      setLoiGateway(error.message);
      setGateways([]);
    } else {
      setLoiGateway("");
      setGateways(rows);
    }
    setDangTaiGateway(false);
  }

  async function taiThietBiTuServer() {
    if (!activeHome?.id || !token) return;

    setTrangThaiServer("checking");
    const [{ gateways: gatewayRows, error: gatewayError }, { devices: rows, error }] = await Promise.all([
      layGatewaysTheoNha(activeHome.id, token),
      layThietBiTheoNha(activeHome.id, token),
    ]);

    if (gatewayError) {
      setLoiGateway(gatewayError.message);
    } else {
      setLoiGateway("");
      setGateways(gatewayRows);
    }

    if (error) {
      setTrangThaiServer("error");
      setLoiHeThong(error.message);
      return;
    }

    setCauHinhNha(chuyenRowsThanhCauHinhNha(rows));
    setTrangThaiServer("online");
    setLoiHeThong("");
  }

  // Tải thiết bị thật theo nhà mà tài khoản đang được cấp quyền.
  useEffect(() => {
    taiThietBiTuServer();
    const timer = window.setInterval(taiThietBiTuServer, 1000);
    return () => window.clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeHome?.id, token]);

  // Nghe thay đổi từ phần Cài đặt trong cùng tab trình duyệt.
  useEffect(() => {
    function handleCauHinhThayDoi(event) {
      setCauHinhNha(Array.isArray(event.detail) ? event.detail : []);
    }

    window.addEventListener("cau-hinh-nha-thay-doi", handleCauHinhThayDoi);
    return () => {
      window.removeEventListener("cau-hinh-nha-thay-doi", handleCauHinhThayDoi);
    };
  }, []);

  const danhSachKhuVucDieuKhien = useMemo(
    () => taoDanhSachKhuVucDieuKhien(cauHinhNha),
    [cauHinhNha],
  );

  const devicesTuCaiDat = useMemo(
    () => taoDanhSachThietBiDieuKhien(cauHinhNha),
    [cauHinhNha],
  );

  useEffect(() => {
    setDevices((currentDevices) =>
      dongBoDanhSachThietBi(currentDevices, devicesTuCaiDat),
    );
  }, [devicesTuCaiDat]);

  const thongKe = useMemo(() => tinhThongKeThietBi(devices), [devices]);
  const trangThaiKetNoiHienThi = useMemo(() => {
    const serverOnline = trangThaiServer === "online";
    const dangKiemTra = trangThaiServer === "checking";

    return {
      ...trangThaiKetNoiMau,
      server: {
        ...trangThaiKetNoiMau.server,
        status: serverOnline ? "online" : "warn",
        detail: serverOnline
          ? `Đã kết nối server - ${activeHome?.name || "nhà"}`
          : dangKiemTra
            ? "Đang kiểm tra server"
            : loiHeThong || "Server chưa sẵn sàng",
        latency: serverOnline ? "OK" : "--",
      },
      supabase: {
        ...trangThaiKetNoiMau.supabase,
        status: serverOnline ? "online" : "warn",
        detail: serverOnline ? "Supabase qua backend" : "Chờ backend xác thực",
        latency: serverOnline ? "OK" : "--",
      },
    };
  }, [activeHome?.name, loiHeThong, trangThaiServer]);

  const hienCoBan = !laMobile || cheDoHienTai === cheDoUi.CO_BAN;
  const hienNangCao = !laMobile || cheDoHienTai === cheDoUi.NANG_CAO;

  async function handleToggleDevice(deviceId) {
    const device = devices.find((item) => item.id === deviceId);
    if (!device || !token) return;

    if (dichVuDangKhoa) {
      window.alert("Nhà/công trình này đang bị khóa dịch vụ hoặc bảo trì.");
      return;
    }

    if (device.canControl === false) {
      window.alert("Bạn không có quyền điều khiển thiết bị này.");
      return;
    }

    const trangThaiMoi = !device.isOn;
    setDevices((current) =>
      current.map((item) => (item.id === deviceId ? { ...item, isOn: trangThaiMoi } : item)),
    );

    const { error } = await guiLenhThietBiServer(deviceId, trangThaiMoi, token);
    if (error) {
      window.alert(`Không điều khiển được thiết bị: ${error.message}`);
      setDevices((current) =>
        current.map((item) => (item.id === deviceId ? { ...item, isOn: device.isOn } : item)),
      );
      return;
    }

    taiThietBiTuServer();
  }

  async function handlePairGateway(pairCode) {
    if (!activeHome?.id || !token) return { error: new Error("Bạn cần đăng nhập trước") };
    if (!laChuNha) return { error: new Error("Chỉ chủ nhà mới được ghép Gateway") };

    setLoiGateway("");
    const ketQua = await ghepGateway(activeHome.id, pairCode, token);
    if (ketQua.error) {
      setLoiGateway(ketQua.error.message || "Không ghép được Gateway");
      return ketQua;
    }

    await taiGatewaysTuServer();
    await taiThietBiTuServer();
    return ketQua;
  }

  async function handleToggleMemberControl(deviceId, memberCanControl) {
    if (!laChuNha || !token) return;

    const { error } = await capNhatThietBiServer(deviceId, { memberCanControl }, token);
    if (error) {
      window.alert(`Không cập nhật quyền thành viên: ${error.message}`);
      return;
    }

    await taiThietBiTuServer();
  }

  async function handleTaoThemNha() {
    const code = window.prompt("Nhập mã thiết bị/mã nhà:", "SMH-HOME-000001");
    if (!code?.trim()) return;

    const { error } = await nhanNhaBangMa(code.trim());
    if (error) {
      window.alert(`Không kết nối được nhà: ${error.message}`);
    }
  }

  async function handleGoChuNha() {
    if (!activeHome?.id) return;
    const xacNhan = window.confirm(
      `Gỡ quyền chủ nhà khỏi ${activeHome.name}?\n\nSau khi gỡ, tài khoản này và thành viên sẽ mất quyền. Mã ${activeHome.home_code} có thể được chủ mới nhập lại.`,
    );
    if (!xacNhan) return;

    const { error } = await goChuNha(activeHome.id);
    if (error) {
      window.alert(`Không gỡ được chủ nhà: ${error.message}`);
    }
  }

  function handleSubmitCommand(event) {
    event.preventDefault();
    if (!lenhNhap.trim()) return;
    // Lệnh giọng nói/text sẽ nối vào backend AI sau. Không điều khiển local ở bản thật.
    setLenhNhap("");
  }

  return (
    <MotionConfig reducedMotion="user">
      <main className="app-shell">
        <div className="nen-ion" aria-hidden="true">
          <span className="vong-nang-luong vong-1" />
          <span className="vong-nang-luong vong-2" />
          <span className="tia-sang tia-1" />
          <span className="tia-sang tia-2" />
        </div>

        <TieuDeUngDung
          tenNha={activeHome?.name}
          homes={homes}
          activeHome={activeHome}
          cheDoHienTai={cheDoHienTai}
          onChangeMode={setCheDoHienTai}
          onMoCaiDat={() => setCaiDatMo(true)}
          onChonHome={setActiveHome}
          onTaoNha={handleTaoThemNha}
          coQuyenQuanLy={laChuNha}
        />

        {dichVuDangKhoa && (
          <section className="canh-bao-dich-vu">
            Nhà/công trình đang ở trạng thái <strong>{activeHome.service_status}</strong>. Hệ thống sẽ chặn điều khiển thiết bị.
          </section>
        )}

        {laChuNha && (
          <section className="khung-ma-nha-v8">
            <div>
              <p className="nhan-nho">MÃ THIẾT BỊ / MÃ NHÀ</p>
              <strong>{activeHome?.home_code || "Chưa có mã"}</strong>
              <span>Mã này dùng để nhận quyền chủ nhà. Gateway ESP32 được quản lý nội bộ, không bắt khách nhập riêng.</span>
            </div>
            <button type="button" onClick={() => setCaiDatMo(true)}>Quản lý thiết bị</button>
          </section>
        )}

        <section className="dashboard-pc">
          {hienCoBan && (
            <div className={`hang-dieu-khien-dau ${cheDoHienTai === cheDoUi.CO_BAN ? "mobile-hien" : "mobile-an"}`}>
              <BangDieuKhienThietBi
                devices={devices}
                danhSachKhuVuc={danhSachKhuVucDieuKhien}
                ketNoi={trangThaiKetNoiHienThi}
                thongKe={thongKe}
                onToggleDevice={handleToggleDevice}
                onToggleMemberControl={handleToggleMemberControl}
                isOwner={laChuNha}
              />
            </div>
          )}

          {hienCoBan && (
            <div className={`cot-co-ban ${cheDoHienTai === cheDoUi.CO_BAN ? "mobile-hien" : "mobile-an"}`}>
              <div className="luoi-tac-vu">
                <OMicroThietBi />

                <ONhapLenh
                  value={lenhNhap}
                  onChange={setLenhNhap}
                  onSubmit={handleSubmitCommand}
                />
              </div>
            </div>
          )}

          {hienNangCao && (
            <aside className={`cot-nang-cao ${cheDoHienTai === cheDoUi.NANG_CAO ? "mobile-hien" : "mobile-an"}`}>
              <BangNangCao ketNoi={trangThaiKetNoiHienThi} />
            </aside>
          )}
        </section>

        <BangCaiDat
          mo={caiDatMo}
          onDong={() => setCaiDatMo(false)}
          cauHinhNhaTuServer={cauHinhNha}
          gateways={gateways}
          activeHome={activeHome}
          onDataChanged={taiThietBiTuServer}
          onReleaseOwner={handleGoChuNha}
        />
      </main>
    </MotionConfig>
  );
}
