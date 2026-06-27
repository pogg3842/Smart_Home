import { Database, RadioTower, ShieldCheck, Wifi } from "lucide-react";

const iconMap = {
  esp32: RadioTower,
  supabase: Database,
  wifi: Wifi,
  auth: ShieldCheck,
};

// Chi tiết kết nối nâng cao hiển thị các dịch vụ
export default function ChiTietKetNoi({ ketNoi }) {
  const danhSachKetNoi = [
    { id: "esp32", title: "ESP32", ...ketNoi.esp32 },
    { id: "supabase", title: "Supabase", ...ketNoi.supabase },
    { id: "wifi", title: "WiFi", ...ketNoi.wifi },
    { id: "auth", title: "Bảo mật", ...ketNoi.auth },
  ];

  return (
    <article className="the-ui chi-tiet-ket-noi">
      <div className="dau-the">
        <div>
          <p className="nhan-nho">ADVANCED CONNECTION</p>
          <h2>Kết nối chi tiết</h2>
        </div>

        <span className="huy-hieu">Nâng cao</span>
      </div>

      <div className="danh-sach-chi-tiet">
        {danhSachKetNoi.map((item) => {
          const Icon = iconMap[item.id];

          return (
            <div className={`dong-chi-tiet ${item.status}`} key={item.id}>
              <div className="icon-chi-tiet">
                <Icon size={19} />
              </div>

              <div>
                <strong>{item.title}</strong>
                <p>{item.detail}</p>
              </div>

              <span>{item.latency}</span>
            </div>
          );
        })}
      </div>
    </article>
  );
}
