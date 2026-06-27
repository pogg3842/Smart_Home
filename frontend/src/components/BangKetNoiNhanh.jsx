import { Activity, Database, Radio, Wifi } from "lucide-react";

// Component hiển thị trạng thái kết nối cơ bản
export default function BangKetNoiNhanh({ ketNoi, thongKe }) {
  return (
    <article className="the-ui bang-ket-noi">
      <div className="dau-the">
        <div>
          <p className="nhan-nho">BASIC STATUS</p>
          <h2>Trạng thái kết nối</h2>
        </div>

        <span className="huy-hieu">Cơ bản</span>
      </div>

      <div className="luoi-ket-noi-nhanh">
        <OTrangThaiKetNoi
          icon={<Radio size={20} />}
          title="ESP32"
          detail={ketNoi.esp32.detail}
          status={ketNoi.esp32.status}
        />

        <OTrangThaiKetNoi
          icon={<Database size={20} />}
          title="Supabase"
          detail={ketNoi.supabase.detail}
          status={ketNoi.supabase.status}
        />

        <OTrangThaiKetNoi
          icon={<Wifi size={20} />}
          title="WiFi"
          detail={ketNoi.wifi.detail}
          status={ketNoi.wifi.status}
        />

        <OTrangThaiKetNoi
          icon={<Activity size={20} />}
          title="Thiết bị bật"
          detail={`${thongKe.dangBat}/${thongKe.tong} đang hoạt động`}
          status="online"
        />
      </div>
    </article>
  );
}

// Ô nhỏ hiển thị trạng thái kết nối từng dịch vụ
function OTrangThaiKetNoi({ icon, title, detail, status }) {
  return (
    <div className={`o-ket-noi ${status}`}>
      <div className="icon-ket-noi">{icon}</div>

      <div>
        <div className="dong-tieu-de-ket-noi">
          <h3>{title}</h3>
          <span className="cham-trang-thai" />
        </div>

        <p>{detail}</p>
      </div>
    </div>
  );
}
