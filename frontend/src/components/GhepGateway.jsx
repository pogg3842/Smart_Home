import { useState } from "react";
import { RadioTower, KeyRound, CheckCircle2 } from "lucide-react";

export default function GhepGateway({ homeName, gateways, dangTai, loi, onPair }) {
  const [pairCode, setPairCode] = useState("");
  const [dangGui, setDangGui] = useState(false);
  const [thongBao, setThongBao] = useState("");

  const daCoGateway = Array.isArray(gateways) && gateways.length > 0;

  async function handleSubmit(event) {
    event.preventDefault();
    const code = pairCode.trim();
    if (!code || dangGui) return;

    setDangGui(true);
    setThongBao("");
    const ketQua = await onPair(code);
    if (!ketQua?.error) {
      setPairCode("");
      setThongBao(ketQua?.message || "Ghép Gateway thành công.");
    }
    setDangGui(false);
  }

  return (
    <section className="the-gateway">
      <div className="gateway-header">
        <div>
          <p className="nhan-nho">GATEWAY</p>
          <h2>{daCoGateway ? "Gateway đã ghép" : "Ghép Gateway đầu tiên"}</h2>
          <p className="mo-ta-dang-nhap">
            {daCoGateway
              ? `Các Gateway đang thuộc ${homeName || "ngôi nhà này"}.`
              : "Nhập mã ghép nối in trên hộp hoặc tem thiết bị. Sau khi ghép và Gateway kết nối WiFi, trạng thái sẽ chuyển Online."}
          </p>
        </div>
        <div className="gateway-icon"><RadioTower size={24} /></div>
      </div>

      {daCoGateway && (
        <div className="danh-sach-gateway">
          {gateways.map((gateway) => (
            <div className="dong-gateway" key={gateway.id}>
              <CheckCircle2 size={18} />
              <div>
                <strong>{gateway.name || "Gateway"}</strong>
                <span>{gateway.status === "online" ? "Online" : "Offline"}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      <form className="form-gateway" onSubmit={handleSubmit}>
        <label>
          Mã ghép nối
          <div className="input-co-icon">
            <KeyRound size={18} />
            <input
              value={pairCode}
              onChange={(event) => setPairCode(event.target.value.toUpperCase())}
              placeholder="VD: SMH-PAIR-001"
              autoComplete="off"
            />
          </div>
        </label>
        {loi && <p className="loi-dang-nhap">{loi}</p>}
        {thongBao && <p className="thong-bao-auth">{thongBao}</p>}
        <button type="submit" disabled={dangGui || dangTai}>
          {dangGui ? "Đang ghép..." : "Ghép Gateway"}
        </button>
      </form>

      <p className="goi-y-gateway">
        Mã test Gateway 1: <strong>SMH-PAIR-001</strong>. Sau khi Gateway Online, website chỉ hiện thiết bị có dây DETECT đang cắm xuống GND.
      </p>
    </section>
  );
}
