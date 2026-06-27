import { Home, Plus, Settings } from "lucide-react";
import { motion } from "motion/react";

import ChuyenCheDoMobile from "./ChuyenCheDoMobile.jsx";

const nutCaiDatMotion = {
  whileTap: { scale: 0.92 },
  transition: { type: "spring", stiffness: 520, damping: 34, mass: 0.5 },
};

export default function TieuDeUngDung({
  tenNha,
  homes = [],
  activeHome,
  cheDoHienTai,
  onChangeMode,
  onMoCaiDat,
  onChonHome,
  onTaoNha,
  coQuyenQuanLy,
}) {
  return (
    <header className="tieu-de">
      <div className="thuong-hieu">
        <div className="logo-ion-core" aria-hidden="true">
          <span className="core-ring core-ring-1" />
          <span className="core-ring core-ring-2" />
          <span className="core-ring core-ring-3" />
          <span className="core-center" />
          <span className="core-glow" />
        </div>

        <div>
          <h1>
            <span className="ten-pc">{tenNha || "SMART HOME"}</span>
            <span className="ten-mobile">{tenNha || "SMART HOME"}</span>
          </h1>
          <p className="ma-nha-header">
            {activeHome?.home_code || "Chưa có mã nhà"} · {activeHome?.role === "owner" ? "Chủ nhà" : "Thành viên"}
          </p>
        </div>
      </div>

      <div className="cum-header-phai">
        <div className="chon-nha-header">
          <Home size={16} />
          <select
            value={activeHome?.id || ""}
            onChange={(event) => {
              const home = homes.find((item) => item.id === event.target.value);
              if (home) onChonHome?.(home);
            }}
            aria-label="Chọn nhà"
          >
            {homes.map((home) => (
              <option key={home.id} value={home.id}>
                {home.name}
              </option>
            ))}
          </select>
          <button type="button" className="nut-them-nha-nho" onClick={onTaoNha} title="Kết nối thêm nhà bằng mã">
            <Plus size={15} />
          </button>
        </div>

        <ChuyenCheDoMobile cheDoHienTai={cheDoHienTai} onChangeMode={onChangeMode} />

        {coQuyenQuanLy && (
          <motion.button
            type="button"
            className="nut-mo-cai-dat"
            aria-label="Mở cài đặt"
            onClick={onMoCaiDat}
            {...nutCaiDatMotion}
          >
            <Settings size={18} />
            <span>Cài đặt</span>
          </motion.button>
        )}
      </div>
    </header>
  );
}
